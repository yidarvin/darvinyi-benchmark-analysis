// GET /api/agent-crawl/runs
//
// Run history for the agent crawl. Mirrors /api/crawl/runs but reads from
// agent_crawl_state.json.

import { NextResponse } from "next/server";

import { ensureSeeded, readAgentCrawlState } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RUNS_CAP = 20;

export async function GET() {
  await ensureSeeded();
  const state = await readAgentCrawlState();
  return NextResponse.json(
    { runs: state.runs.slice(0, RUNS_CAP) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
