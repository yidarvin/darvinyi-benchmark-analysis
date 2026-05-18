// Agent-evaluation discovery agent.
//
// Sister module to `crawl-agent.ts`. Same skeleton (claude-agent-sdk + one MCP
// tool exposing existing entries), but the model is asked to discover *agent
// evaluation systems* (RLI, GDPval, SWE-Lancer-style real-work suites, etc.)
// and emit a record that matches the camelCase `AgentSystem` render shape so
// it can be persisted directly into $DATA_DIR/agents.json.
//
// Output schema is intentionally tolerant: lists like `examples`/`results`
// default to empty when omitted, and stats fields that some existing entries
// store as null (e.g. BigLaw Bench's `totalTasks`) accept null.

import {
  createSdkMcpServer,
  query,
  tool,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import type { AgentRecord, AgentSystem } from "@/lib/types";

// ─── Public types ─────────────────────────────────────────────────────────────

export type ProposedAgent = AgentSystem;

export interface AgentCrawlResult {
  proposed_agents: ProposedAgent[];
  reasoning_summary: string;
  raw_log: string;
}

export interface ProgressEvent {
  type:
    | "agent_start"
    | "assistant_text"
    | "tool_call"
    | "tool_result"
    | "agent_done"
    | "agent_error";
  message: string;
}

export interface RunAgentCrawlOptions {
  existingAgents: AgentRecord[];
  onProgress?: (event: ProgressEvent) => void;
  model?: string;
  maxTurns?: number;
  timeoutMs?: number;
  apiKey?: string;
}

export class AgentOutputError extends Error {
  override readonly name = "AgentOutputError";
  readonly offendingText: string;

  constructor(message: string, offendingText: string) {
    super(message);
    this.offendingText = offendingText;
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = "claude-sonnet-4-6";
// Agent prompts ask for much richer output, so allow more research turns.
const DEFAULT_MAX_TURNS = 30;
const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000;
const RAW_LOG_MAX_BYTES = 10 * 1024;
const MCP_SERVER_NAME = "agent-crawl-tools";

// ─── Schema ───────────────────────────────────────────────────────────────────

const AgentExampleSchema = z.object({
  title: z.string().min(1),
  jobType: z.string().optional(),
  economicValue: z.string().optional(),
  humanTime: z.string().optional(),
  description: z.string().min(1),
  input: z.string().min(1),
  output: z.string().min(1),
  evaluation: z.string().min(1),
});

const AgentResultSchema = z.object({
  modelId: z.string().min(1),
  score: z.number(),
  scoreLabel: z.string().min(1),
  scoreType: z.string().min(1),
  date: z.string().min(1),
  isVendorReported: z.boolean(),
  domain: z.string().optional(),
  notes: z.string().optional(),
});

const AgentStatsSchema = z.object({
  // Existing entries (e.g. BigLaw Bench) store these as null.
  totalTasks: z.number().int().nullable(),
  publicTasks: z.number().int().nullable().optional(),
  domains: z.array(z.string()).default([]),
  avgHumanTime: z.string().optional(),
  totalEconomicValue: z.string().optional(),
  evaluationMethod: z.string().min(1),
  primaryMetric: z.string().min(1),
});

const TaskAnatomySchema = z.object({
  setup: z.string().min(1),
  input: z.string().min(1),
  output: z.string().min(1),
  evaluation: z.string().min(1),
  metric: z.string().min(1),
});

const LinksSchema = z.object({
  paper: z.string().url().optional(),
  arxiv: z.string().url().optional(),
  dataset: z.string().url().optional(),
  leaderboard: z.string().url().optional(),
  github: z.string().url().optional(),
  website: z.string().url().optional(),
});

const ProposedAgentSchema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  shortDescription: z.string().min(1).max(400),
  description: z.string().min(1),
  creator: z.string().min(1),
  institution: z.string().min(1),
  year: z.number().int().min(2015).max(2100),
  tags: z.array(z.string()).default([]),
  isRequired: z.boolean().default(false),
  stats: AgentStatsSchema,
  taskAnatomy: TaskAnatomySchema,
  examples: z.array(AgentExampleSchema).default([]),
  results: z.array(AgentResultSchema).default([]),
  keyFindings: z.array(z.string()).optional(),
  whatMakesItUnique: z.array(z.string()).optional(),
  controversies: z.array(z.string()).optional(),
  links: LinksSchema,
});

const AgentOutputSchema = z.object({
  proposed_agents: z.array(ProposedAgentSchema),
  reasoning_summary: z.string().min(1),
});

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(existingAgents: AgentRecord[]): string {
  const summarized = existingAgents
    .map((a) => `- ${a.name} [${a.year}] (${a.institution})`)
    .join("\n");

  const years = existingAgents
    .map((a) => a.year)
    .filter((y): y is number => typeof y === "number");
  const latestYear = years.length > 0 ? Math.max(...years) : null;

  const today = new Date().toISOString().slice(0, 10);
  const cutoffNote = latestYear
    ? `The most recent agent evaluation in our set is from ${latestYear}. Prioritize anything announced or substantially updated on/after ${latestYear}-01-01, with strong focus on the last 6 months relative to today (${today}).`
    : `Focus on agent evaluations announced or substantially updated in the last 12 months relative to today (${today}).`;

  return `You are a benchmark-discovery researcher for an AI evaluation site, focused specifically on AGENT EVALUATION SYSTEMS — benchmarks that measure end-to-end agentic capability on real human work, not isolated capability tests.

Your job: find AGENT evaluation systems that are NOT in our existing set and that meaningfully advance how we measure agentic AI on real tasks. ${cutoffNote}

## What counts as an agent evaluation (vs a standard LLM benchmark)
- Tests complete, end-to-end real-world tasks (drafting a memo, completing a freelance project, performing diagnosis, managing a workflow), NOT isolated multiple-choice or single-snippet problems.
- Has economic or professional grounding: real client briefs, real expert rubrics, real billable work, or simulated full-job scenarios.
- Typically reports automation/completion rates, Elo from expert preference, or task-completion percentages — not just accuracy on a question set.
- Examples already in our set: Remote Labor Index (RLI), GDPval, SWE-Lancer (covered as a benchmark variant), METR Time-Horizon, Upwork-HAPI, BigLaw Bench, Mercor APEX.

If a candidate is really a capability benchmark (math/coding/reasoning quizzes, single-step Q&A), reject it — it belongs to the other crawl.

## Sources to scan (use WebSearch, then WebFetch on the most relevant hits)
- arxiv.org recent submissions in cs.AI / cs.CL / cs.LG with "agent", "evaluation", "real-work", "task automation"
- Lab blog posts: anthropic.com/news, openai.com/blog, deepmind.google, ai.meta.com/blog, scale.com/blog, mercor.com
- Independent eval orgs: METR, CAIS, Apollo Research, AI Safety Institute
- huggingface.co/papers and HuggingFace leaderboards
- Industry-vertical AI companies that publish agent benchmarks (Harvey AI, Cursor, Cognition, Devin, etc.)

## Method
1. Call \`list_existing_agents\` once at the start to anchor on what we already have. Re-call if you lose track.
2. Run several WebSearch queries — combine "agent benchmark" / "real-world tasks" / "automation rate" with the current and previous calendar year.
3. For each promising hit, **verify from a primary source** (paper, official site, lab announcement). If you cannot verify, discard it.
4. Skip duplicates: match by lowercased+trimmed \`name\` or by any URL in \`links\` against the existing set. When in doubt, skip.
5. Stop when you have 2–6 strong candidates, or when further search yields nothing new. Zero is a valid outcome — say so in \`reasoning_summary\`.

## Output contract — strict
When done, emit a SINGLE final assistant message containing nothing but a fenced JSON block matching this exact schema (camelCase, matching the AgentSystem render type):

\`\`\`json
{
  "proposed_agents": [
    {
      "slug": "kebab-case-stable-id",
      "name": "Canonical short name (e.g. 'BigLaw Bench')",
      "shortDescription": "<= 280 chars; what it tests and what's notable",
      "description": "2–4 paragraphs covering: what the benchmark is, why it was built, what makes it different, key findings or headline numbers.",
      "creator": "Original creator(s)",
      "institution": "Institution / company",
      "year": 2025,
      "tags": ["real-work", "agent", "domain-specific", ...],
      "isRequired": false,
      "stats": {
        "totalTasks": 240,
        "publicTasks": 10,
        "domains": ["3D Animation", "CAD", ...],
        "avgHumanTime": "28.9 hours (median: 11.5 hours)",
        "totalEconomicValue": "$143,991 across 240 projects",
        "evaluationMethod": "Manual expert evaluation: 3-point scale, 3 evaluators, majority vote.",
        "primaryMetric": "Automation Rate"
      },
      "taskAnatomy": {
        "setup": "...",
        "input": "...",
        "output": "...",
        "evaluation": "...",
        "metric": "..."
      },
      "examples": [
        {
          "title": "Domain — Specific example title",
          "jobType": "Game Development",
          "economicValue": "$800",
          "humanTime": "22 hours",
          "description": "What the task asks for.",
          "input": "What the agent receives.",
          "output": "What the agent must produce.",
          "evaluation": "How success is judged."
        }
      ],
      "results": [
        {
          "modelId": "gpt-5",
          "score": 8.7,
          "scoreLabel": "8.7%",
          "scoreType": "Automation Rate",
          "date": "2025-10",
          "isVendorReported": false,
          "domain": "Game Development",
          "notes": "Best Agent setup"
        }
      ],
      "keyFindings": ["1–4 specific quantitative or comparative findings."],
      "whatMakesItUnique": ["1–4 bullets on what differentiates this benchmark."],
      "controversies": ["Any methodological caveats, biases, or commercial conflicts."],
      "links": {
        "paper": "https://...",
        "arxiv": "https://arxiv.org/abs/...",
        "leaderboard": "https://...",
        "website": "https://..."
      }
    }
  ],
  "reasoning_summary": "1–3 sentences summarizing the search trail and which sources were richest."
}
\`\`\`

Rules for the final message:
- The fenced block must be valid JSON that parses cleanly — no trailing commas, no comments, no ellipses.
- \`totalTasks\` may be \`null\` if not publicly disclosed.
- Omit optional fields (\`publicTasks\`, \`avgHumanTime\`, \`totalEconomicValue\`, \`keyFindings\`, \`whatMakesItUnique\`, \`controversies\`) if you don't have verified content for them. Don't fabricate.
- \`results\` entries must use a real, identifiable model id (e.g. \`gpt-5\`, \`claude-opus-4-6\`, \`gemini-2-5-pro\`, \`o3\`). If you cannot verify scores for any model, return \`"results": []\` — empty is fine.
- \`examples\` are illustrative — base them on documented task formats; do not invent specific dollar values or hours that aren't in the source.
- No prose before or after the fenced block in the final message.
- If you found nothing new, return \`"proposed_agents": []\` and explain why in \`reasoning_summary\`.

## Existing agent evaluations (do not propose these)
${summarized || "(none)"}
`;
}

// ─── Custom tool ──────────────────────────────────────────────────────────────

function buildMcpServer(existingAgents: AgentRecord[]) {
  const compact = existingAgents.map((a) => ({
    slug: a.slug,
    name: a.name,
    institution: a.institution,
    year: a.year,
    links: a.links,
  }));

  return createSdkMcpServer({
    name: MCP_SERVER_NAME,
    version: "1.0.0",
    tools: [
      tool(
        "list_existing_agents",
        "Return the existing agent-evaluation set as JSON so you can re-check for duplicates without retaining the entire list in working memory. Use this whenever you suspect a candidate might already be covered.",
        {},
        async () => ({
          content: [{ type: "text", text: JSON.stringify(compact) }],
        }),
      ),
    ],
  });
}

// ─── Raw-log accumulator ─────────────────────────────────────────────────────

class RawLog {
  private parts: string[] = [];
  private size = 0;

  append(line: string): void {
    if (this.size >= RAW_LOG_MAX_BYTES) return;
    const remaining = RAW_LOG_MAX_BYTES - this.size;
    const slice = line.length > remaining ? line.slice(0, remaining) : line;
    this.parts.push(slice);
    this.size += slice.length;
  }

  toString(): string {
    const body = this.parts.join("\n");
    return body.length > RAW_LOG_MAX_BYTES
      ? body.slice(0, RAW_LOG_MAX_BYTES) + "\n…[truncated]"
      : body;
  }
}

// ─── Output extraction ───────────────────────────────────────────────────────

function extractJsonBlock(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/i);
  if (fenced) return fenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.slice(start, end + 1).trim();

  return null;
}

function parseAgentOutput(
  finalText: string,
): { proposed_agents: ProposedAgent[]; reasoning_summary: string } {
  const block = extractJsonBlock(finalText);
  if (!block) {
    throw new AgentOutputError(
      "agent emitted no JSON block in its final message",
      finalText,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(block);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new AgentOutputError(
      `agent output JSON parse failed: ${detail}`,
      block,
    );
  }

  const result = AgentOutputSchema.safeParse(parsed);
  if (!result.success) {
    throw new AgentOutputError(
      `agent output failed schema validation: ${result.error.message}`,
      block,
    );
  }
  return {
    proposed_agents: result.data.proposed_agents as ProposedAgent[],
    reasoning_summary: result.data.reasoning_summary,
  };
}

// ─── Run ──────────────────────────────────────────────────────────────────────

export async function runAgentCrawlAgent(
  opts: RunAgentCrawlOptions,
): Promise<AgentCrawlResult> {
  const {
    existingAgents,
    onProgress,
    model = process.env.AGENT_CRAWL_MODEL ?? process.env.CRAWL_MODEL ?? DEFAULT_MODEL,
    maxTurns = Number(
      process.env.AGENT_CRAWL_MAX_TURNS ?? process.env.CRAWL_MAX_TURNS ?? DEFAULT_MAX_TURNS,
    ),
    timeoutMs = Number(
      process.env.AGENT_CRAWL_TIMEOUT_MS ?? process.env.CRAWL_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS,
    ),
    apiKey = process.env.ANTHROPIC_API_KEY,
  } = opts;

  if (!apiKey) {
    throw new Error(
      "runAgentCrawlAgent: ANTHROPIC_API_KEY is required (pass via opts.apiKey or env)",
    );
  }

  const systemPrompt = buildSystemPrompt(existingAgents);
  const mcpServer = buildMcpServer(existingAgents);

  const abortController = new AbortController();
  let timedOut = false;
  const timeoutHandle = setTimeout(() => {
    timedOut = true;
    abortController.abort(
      new Error(`agent crawl timed out after ${timeoutMs}ms`),
    );
  }, timeoutMs);

  const log = new RawLog();
  const emit = (event: ProgressEvent) => {
    log.append(`[${event.type}] ${event.message}`);
    onProgress?.(event);
  };

  emit({
    type: "agent_start",
    message: `model=${model} maxTurns=${maxTurns} existing=${existingAgents.length}`,
  });

  let finalText = "";

  try {
    const initialPrompt =
      "Begin the agent-evaluation discovery workflow. Call list_existing_agents first, then research per your system prompt. End with the required fenced JSON block.";

    const iterator = query({
      prompt: initialPrompt,
      options: {
        model,
        systemPrompt,
        maxTurns,
        mcpServers: { [MCP_SERVER_NAME]: mcpServer },
        allowedTools: [
          "WebSearch",
          "WebFetch",
          `mcp__${MCP_SERVER_NAME}__list_existing_agents`,
        ],
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        abortController,
        ...(process.env.CLAUDE_CODE_EXECUTABLE
          ? { pathToClaudeCodeExecutable: process.env.CLAUDE_CODE_EXECUTABLE }
          : {}),
        env: { ...process.env, ANTHROPIC_API_KEY: apiKey },
      },
    });

    for await (const message of iterator) {
      if (abortController.signal.aborted) break;

      if (message.type === "assistant") {
        const blocks = message.message?.content ?? [];
        let turnText = "";
        for (const block of blocks) {
          if (block.type === "text") {
            turnText += block.text;
          } else if (block.type === "tool_use") {
            const argsPreview = safeStringify(block.input, 200);
            emit({
              type: "tool_call",
              message: `${block.name}(${argsPreview})`,
            });
          }
        }
        if (turnText.trim().length > 0) {
          finalText = turnText;
          emit({
            type: "assistant_text",
            message:
              turnText.length > 240 ? turnText.slice(0, 240) + "…" : turnText,
          });
        }
      } else if (message.type === "user") {
        const blocks = message.message?.content;
        if (Array.isArray(blocks)) {
          for (const block of blocks) {
            if (
              typeof block === "object" &&
              block !== null &&
              "type" in block &&
              block.type === "tool_result"
            ) {
              const content = "content" in block ? block.content : undefined;
              const summary = summarizeToolResult(content);
              emit({ type: "tool_result", message: summary });
            }
          }
        }
      } else if (message.type === "result") {
        emit({
          type: "agent_done",
          message: `subtype=${message.subtype} turns=${"num_turns" in message ? message.num_turns : "?"}`,
        });
      }
    }
  } catch (err) {
    if (timedOut) {
      const timeoutErr = new Error(
        `agent crawl timed out after ${timeoutMs}ms (no final JSON received)`,
      );
      emit({ type: "agent_error", message: timeoutErr.message });
      throw timeoutErr;
    }
    const detail = err instanceof Error ? err.message : String(err);
    emit({ type: "agent_error", message: detail });
    throw err;
  } finally {
    clearTimeout(timeoutHandle);
  }

  const { proposed_agents, reasoning_summary } = parseAgentOutput(finalText);

  return {
    proposed_agents,
    reasoning_summary,
    raw_log: log.toString(),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeStringify(value: unknown, maxLen: number): string {
  try {
    const s = JSON.stringify(value);
    if (!s) return "";
    return s.length > maxLen ? s.slice(0, maxLen) + "…" : s;
  } catch {
    return "[unserializable]";
  }
}

function summarizeToolResult(content: unknown): string {
  if (typeof content === "string") {
    return content.length > 200 ? content.slice(0, 200) + "…" : content;
  }
  if (Array.isArray(content)) {
    const text = content
      .map((c) =>
        typeof c === "object" && c && "text" in c
          ? String((c as { text: unknown }).text)
          : "",
      )
      .join(" ");
    return text.length > 200 ? text.slice(0, 200) + "…" : text || "[tool_result]";
  }
  return "[tool_result]";
}
