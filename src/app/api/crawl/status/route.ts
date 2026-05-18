// GET /api/crawl/status
//
// Snapshot of crawl bookkeeping. Used by the client to drive its polling
// loop and to disable the trigger button while a run is in flight or while
// cooldown is active.

import { NextResponse } from "next/server";

import { cooldownRemainingSeconds } from "@/lib/crawl-config";
import { ensureSeeded, readCrawlState } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  const state = await readCrawlState();

  const remaining = cooldownRemainingSeconds(state.last_completed_at);
  const canTrigger = state.last_status !== "running" && remaining === 0;

  return NextResponse.json(
    {
      status: state.last_status,
      last_completed_at: state.last_completed_at,
      last_started_at: state.last_started_at,
      current_run_id: state.current_run_id,
      cooldown_seconds_remaining: remaining,
      can_trigger: canTrigger,
      most_recent_run: state.runs[0] ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
