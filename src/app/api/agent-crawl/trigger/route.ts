// POST /api/agent-crawl/trigger
//
// Sister route to /api/crawl/trigger. Runs the agent-evaluation discovery
// crawl with the same cooldown contract:
//   - 409 if an agent crawl is already running
//   - 429 + Retry-After if within the 24h cooldown after a completion
//   - 202 + run_id when accepted; runs fire-and-forget on the server
//
// State is tracked in $DATA_DIR/agent_crawl_state.json (separate from the
// benchmark crawl), so the two crawls have independent cooldowns.

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { runAgentCrawlAgent } from "@/agent/agent-crawl-agent";
import { cooldownMs, cooldownRemainingSeconds } from "@/lib/crawl-config";
import { mergeAgentProposals } from "@/lib/agent-merge";
import {
  ensureSeeded,
  readAgents,
  updateAgents,
  updateAgentCrawlState,
} from "@/lib/storage";
import type { CrawlRun } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RUNS_CAP = 20;
const LOG_SUMMARY_MAX = 2000;

type TriggerOutcome =
  | { kind: "running"; runId: string | null }
  | { kind: "cooldown"; retryAfterSeconds: number; lastCompletedAt: string }
  | { kind: "go"; runId: string };

export async function POST() {
  await ensureSeeded();

  let outcome: TriggerOutcome | null = null;

  await updateAgentCrawlState((current) => {
    if (current.last_status === "running") {
      outcome = { kind: "running", runId: current.current_run_id };
      return current;
    }

    const remaining = cooldownRemainingSeconds(current.last_completed_at);
    if (remaining > 0 && current.last_completed_at) {
      outcome = {
        kind: "cooldown",
        retryAfterSeconds: remaining,
        lastCompletedAt: current.last_completed_at,
      };
      return current;
    }

    const runId = randomUUID();
    const startedAt = new Date().toISOString();
    const placeholder: CrawlRun = {
      id: runId,
      started_at: startedAt,
      completed_at: null,
      status: "running",
      candidates_found: 0,
      added: 0,
      skipped_duplicates: 0,
      error: null,
      log_summary: "",
    };

    outcome = { kind: "go", runId };

    return {
      ...current,
      last_status: "running",
      last_started_at: startedAt,
      current_run_id: runId,
      runs: [placeholder, ...current.runs].slice(0, RUNS_CAP),
    };
  });

  if (!outcome) {
    return NextResponse.json(
      { error: "internal", message: "trigger outcome was not set" },
      { status: 500 },
    );
  }

  const decided = outcome as TriggerOutcome;

  if (decided.kind === "running") {
    return NextResponse.json(
      { error: "crawl_in_progress", run_id: decided.runId },
      { status: 409 },
    );
  }

  if (decided.kind === "cooldown") {
    return NextResponse.json(
      {
        error: "cooldown",
        retry_after_seconds: decided.retryAfterSeconds,
        last_completed_at: decided.lastCompletedAt,
      },
      {
        status: 429,
        headers: { "Retry-After": String(decided.retryAfterSeconds) },
      },
    );
  }

  void runCrawl(decided.runId).catch((err) => {
    console.error(`[agent-crawl ${decided.runId}] unhandled error after dispatch:`, err);
  });

  return NextResponse.json({ run_id: decided.runId }, { status: 202 });
}

async function runCrawl(runId: string): Promise<void> {
  console.log(`[agent-crawl ${runId}] starting (cooldown=${cooldownMs()}ms)`);
  try {
    const existing = await readAgents();
    const result = await runAgentCrawlAgent({ existingAgents: existing });

    let candidatesFound = result.proposed_agents.length;
    let addedCount = 0;
    let skippedCount = 0;

    await updateAgents((current) => {
      const r = mergeAgentProposals(current, result.proposed_agents, { runId });
      addedCount = r.added.length;
      skippedCount = r.skipped.length;
      return r.merged;
    });

    const completedAt = new Date().toISOString();
    const summary = buildLogSummary(result.reasoning_summary, result.raw_log);

    await updateAgentCrawlState((current) => ({
      ...current,
      last_status: "success",
      last_completed_at: completedAt,
      current_run_id: null,
      runs: current.runs.map((r) =>
        r.id === runId
          ? {
              ...r,
              status: "success" as const,
              completed_at: completedAt,
              candidates_found: candidatesFound,
              added: addedCount,
              skipped_duplicates: skippedCount,
              log_summary: summary,
            }
          : r,
      ),
    }));

    console.log(
      `[agent-crawl ${runId}] done — candidates=${candidatesFound} added=${addedCount} skipped=${skippedCount}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[agent-crawl ${runId}] failed:`, err);
    const completedAt = new Date().toISOString();
    try {
      await updateAgentCrawlState((current) => ({
        ...current,
        last_status: "failed",
        last_completed_at: completedAt,
        current_run_id: null,
        runs: current.runs.map((r) =>
          r.id === runId
            ? {
                ...r,
                status: "failed" as const,
                completed_at: completedAt,
                error: message,
              }
            : r,
        ),
      }));
    } catch (writeErr) {
      console.error(
        `[agent-crawl ${runId}] could not persist failure state:`,
        writeErr,
      );
    }
  }
}

function buildLogSummary(reasoning: string, rawLog: string): string {
  const joined = rawLog ? `${reasoning}\n\n${rawLog}` : reasoning;
  return joined.length > LOG_SUMMARY_MAX ? joined.slice(0, LOG_SUMMARY_MAX) : joined;
}
