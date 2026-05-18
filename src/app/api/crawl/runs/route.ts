// GET /api/crawl/runs
//
// Returns the run history (newest first, capped at 20). The state file is
// already capped to 20 by the trigger route, but we slice again defensively
// in case a hand-edited file pushed it higher.

import { NextResponse } from "next/server";

import { ensureSeeded, readCrawlState } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RUNS_CAP = 20;

export async function GET() {
  await ensureSeeded();
  const state = await readCrawlState();
  return NextResponse.json(
    { runs: state.runs.slice(0, RUNS_CAP) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
