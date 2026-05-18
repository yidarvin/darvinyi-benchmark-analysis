// Benchmark-discovery agent.
//
// Wraps `@anthropic-ai/claude-agent-sdk` to drive a single web-research run
// that proposes new LLM/AI benchmarks. The agent does NOT touch disk — it
// returns a structured `CrawlResult` and lets callers (API route, CLI
// harness) decide what to persist.
//
// Pattern mirrors `server/src/agent/researchAgent.ts` from
// `yidarvin/darvinyi-research-topic`: build a system prompt, spin up an MCP
// server with one in-process tool, run `query()`, drain the message stream,
// extract a fenced JSON block from the last assistant turn.

import {
  createSdkMcpServer,
  query,
  tool,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import type { BenchmarkRecord } from "@/lib/types";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ProposedBenchmark {
  name: string;
  short_description: string;
  source_url: string;
  category: string;
  year_introduced: number;
  notes: string;
}

export interface CrawlResult {
  proposed_benchmarks: ProposedBenchmark[];
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

export interface RunCrawlAgentOptions {
  existingBenchmarks: BenchmarkRecord[];
  onProgress?: (event: ProgressEvent) => void;
  // Overrides — primarily for testing / env-driven config.
  model?: string;
  maxTurns?: number;
  timeoutMs?: number;
  apiKey?: string;
}

// Thrown when the agent finishes but its final message can't be parsed into
// the expected schema. The caller can log `offendingText` to debug a
// misbehaving prompt without re-running.
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
const DEFAULT_MAX_TURNS = 20;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const RAW_LOG_MAX_BYTES = 10 * 1024;
const MCP_SERVER_NAME = "crawl-tools";

// ─── Schema ───────────────────────────────────────────────────────────────────

const ProposedBenchmarkSchema = z.object({
  name: z.string().min(1).max(200),
  short_description: z.string().min(1).max(400),
  source_url: z.string().url(),
  category: z.string().min(1).max(80),
  year_introduced: z.number().int().min(2015).max(2100),
  notes: z.string().max(2000),
});

const AgentOutputSchema = z.object({
  proposed_benchmarks: z.array(ProposedBenchmarkSchema),
  reasoning_summary: z.string().min(1),
});

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(existingBenchmarks: BenchmarkRecord[]): string {
  const summarized = existingBenchmarks
    .map((b) => {
      const year =
        typeof b.description?.year === "number" ? b.description.year : null;
      return `- ${b.name}${b.full_name ? ` (${b.full_name})` : ""}${
        year ? ` [${year}]` : ""
      }`;
    })
    .join("\n");

  const years = existingBenchmarks
    .map((b) => b.description?.year)
    .filter((y): y is number => typeof y === "number");
  const latestYear = years.length > 0 ? Math.max(...years) : null;

  const today = new Date().toISOString().slice(0, 10);
  const cutoffNote = latestYear
    ? `The most recent benchmark in our set is from ${latestYear}. Prioritize anything announced or substantially updated on/after ${latestYear}-01-01, with strong focus on the last 6 months relative to today (${today}).`
    : `Focus on benchmarks announced or substantially updated in the last 12 months relative to today (${today}).`;

  return `You are a benchmark-discovery researcher for an LLM/AI evaluation site.

Your job: find LLM/AI evaluation benchmarks (e.g. coding, math, reasoning, agentic tasks, multimodal, safety) that are NOT in our existing set and that meaningfully advance the state of evaluation. ${cutoffNote}

## Sources to scan (use WebSearch, then WebFetch on the most relevant hits)
- arxiv.org recent submissions in cs.LG / cs.CL / cs.AI
- Lab blog posts: anthropic.com/news, openai.com/blog, deepmind.google, ai.meta.com/blog, blog.google/technology/ai
- paperswithcode.com leaderboards
- huggingface.co/papers and HuggingFace leaderboards
- ML newsletters / digests when they reference primary sources you can verify

## Method
1. Call \`list_existing_benchmarks\` once at the start to anchor on what we already have. Re-call if you lose track.
2. Run a few WebSearch queries; favor terms like "new benchmark", "evaluation suite", "leaderboard", combined with the current and previous calendar year.
3. For each promising hit, **verify from at least one primary source** (arxiv abstract, official site, lab announcement). If you can't verify, discard it — no rumors.
4. **Skip duplicates.** Match by lowercased+trimmed \`name\` OR by \`source_url\` against the existing set. When in doubt, skip.
5. Stop when you've produced 3-10 strong candidates, or when further search yields nothing new. Zero candidates is a valid outcome — say so in \`reasoning_summary\`.

## Output contract — strict
When you are done researching, emit a SINGLE final assistant message containing nothing but a fenced JSON block matching this schema:

\`\`\`json
{
  "proposed_benchmarks": [
    {
      "name": "string (canonical short name)",
      "short_description": "string, <= 280 chars",
      "source_url": "https://... (primary source you verified)",
      "category": "string (e.g. coding, math, reasoning, agent, multimodal, safety)",
      "year_introduced": 2025,
      "notes": "string: why it matters / what it tests / how it differs from existing benchmarks"
    }
  ],
  "reasoning_summary": "1-3 sentences summarizing the search trail and which sources were richest."
}
\`\`\`

Rules for the final message:
- The fenced block must be valid JSON that parses cleanly — no trailing commas, no comments, no ellipses.
- No prose before or after the fenced block in the final message.
- If you found nothing new, return \`"proposed_benchmarks": []\` and explain why in \`reasoning_summary\`.

## Existing benchmarks (do not propose these)
${summarized || "(none)"}
`;
}

// ─── Custom tool ──────────────────────────────────────────────────────────────

function buildMcpServer(existingBenchmarks: BenchmarkRecord[]) {
  const compact = existingBenchmarks.map((b) => ({
    id: b.id,
    name: b.name,
    full_name: b.full_name,
    slug: b.slug,
    category: b.category,
    year:
      typeof b.description?.year === "number" ? b.description.year : null,
    source_url: b.source_url,
  }));

  return createSdkMcpServer({
    name: MCP_SERVER_NAME,
    version: "1.0.0",
    tools: [
      tool(
        "list_existing_benchmarks",
        "Return the existing benchmark set as JSON so you can re-check for duplicates without retaining the entire list in working memory. Use this whenever you suspect a candidate might already be covered.",
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

// The agent is instructed to emit a single ```json fenced block. We try a
// fenced block first, then fall back to the first balanced object literal in
// the text, so a slightly-off-spec final turn still parses.
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
): { proposed_benchmarks: ProposedBenchmark[]; reasoning_summary: string } {
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
  return result.data;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

export async function runCrawlAgent(
  opts: RunCrawlAgentOptions,
): Promise<CrawlResult> {
  const {
    existingBenchmarks,
    onProgress,
    model = process.env.CRAWL_MODEL ?? DEFAULT_MODEL,
    maxTurns = Number(process.env.CRAWL_MAX_TURNS ?? DEFAULT_MAX_TURNS),
    timeoutMs = DEFAULT_TIMEOUT_MS,
    apiKey = process.env.ANTHROPIC_API_KEY,
  } = opts;

  if (!apiKey) {
    throw new Error(
      "runCrawlAgent: ANTHROPIC_API_KEY is required (pass via opts.apiKey or env)",
    );
  }

  const systemPrompt = buildSystemPrompt(existingBenchmarks);
  const mcpServer = buildMcpServer(existingBenchmarks);

  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    abortController.abort(new Error(`crawl agent timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  const log = new RawLog();
  const emit = (event: ProgressEvent) => {
    log.append(`[${event.type}] ${event.message}`);
    onProgress?.(event);
  };

  emit({
    type: "agent_start",
    message: `model=${model} maxTurns=${maxTurns} existing=${existingBenchmarks.length}`,
  });

  let finalText = "";

  try {
    const initialPrompt =
      "Begin the benchmark discovery workflow. Call list_existing_benchmarks first, then research per your system prompt. End with the required fenced JSON block.";

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
          `mcp__${MCP_SERVER_NAME}__list_existing_benchmarks`,
        ],
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        abortController,
        // Next.js standalone output drops the SDK's optional native binary, so
        // in the container we point at the copy staged by the Dockerfile.
        ...(process.env.CLAUDE_CODE_EXECUTABLE
          ? { pathToClaudeCodeExecutable: process.env.CLAUDE_CODE_EXECUTABLE }
          : {}),
        // Pass the API key explicitly into the subprocess Claude Code spawns.
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
            message: turnText.length > 240 ? turnText.slice(0, 240) + "…" : turnText,
          });
        }
      } else if (message.type === "user") {
        // SDK surfaces tool results via a synthetic user message.
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
    const detail = err instanceof Error ? err.message : String(err);
    emit({ type: "agent_error", message: detail });
    throw err;
  } finally {
    clearTimeout(timeoutHandle);
  }

  const { proposed_benchmarks, reasoning_summary } =
    parseAgentOutput(finalText);

  return {
    proposed_benchmarks,
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
      .map((c) => (typeof c === "object" && c && "text" in c ? String((c as { text: unknown }).text) : ""))
      .join(" ");
    return text.length > 200 ? text.slice(0, 200) + "…" : text || "[tool_result]";
  }
  return "[tool_result]";
}
