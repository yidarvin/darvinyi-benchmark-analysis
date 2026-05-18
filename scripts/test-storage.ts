// Smoke test for src/lib/storage.ts. Exercises the bootstrap path against a
// throwaway DATA_DIR and round-trips a synthetic crawl state.
//
// Run via `pnpm test:storage`. Uses Node's built-in type stripping (≥22.6),
// so no tsx/ts-node dependency is required. Imports are relative — the
// project's `@/` alias only resolves under bundlers, not plain Node.

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  dataDir,
  ensureSeeded,
  readBenchmarks,
  readCrawlState,
  writeCrawlState,
} from "../src/lib/storage.ts";
import type { CrawlState } from "../src/lib/types.ts";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  const tmpRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "storage-smoke-"),
  );
  process.env.DATA_DIR = tmpRoot;
  // Point at the repo's benchmarks.json as the seed (the Dockerfile uses
  // /app/seed/benchmarks.json, which obviously doesn't exist locally).
  process.env.SEED_FILE = path.resolve(
    process.cwd(),
    "benchmarks.json",
  );

  console.log(`[smoke] DATA_DIR=${dataDir()}`);
  console.log(`[smoke] SEED_FILE=${process.env.SEED_FILE}`);

  // ── Seed ──────────────────────────────────────────────────────────────
  await ensureSeeded();
  const benchmarksFileExists = await fs
    .access(path.join(tmpRoot, "benchmarks.json"))
    .then(() => true, () => false);
  assert(benchmarksFileExists, "benchmarks.json was not seeded to DATA_DIR");

  const stateFileExists = await fs
    .access(path.join(tmpRoot, "crawl_state.json"))
    .then(() => true, () => false);
  assert(stateFileExists, "crawl_state.json was not seeded to DATA_DIR");

  // ── Read benchmarks ────────────────────────────────────────────────────
  const list = await readBenchmarks();
  assert(Array.isArray(list), "readBenchmarks() did not return an array");
  assert(
    list.length > 0,
    `expected at least 1 benchmark in seed, got ${list.length}`,
  );
  console.log(`[smoke] read ${list.length} benchmarks from seed`);

  // ── Default crawl state ────────────────────────────────────────────────
  const initialState = await readCrawlState();
  assert(
    initialState.last_status === "idle",
    `expected initial status "idle", got "${initialState.last_status}"`,
  );
  assert(
    initialState.runs.length === 0,
    `expected empty runs array, got ${initialState.runs.length}`,
  );

  // ── Round-trip ────────────────────────────────────────────────────────
  const runId = randomUUID();
  const startedAt = new Date().toISOString();
  const fakeState: CrawlState = {
    last_started_at: startedAt,
    last_completed_at: null,
    last_status: "running",
    current_run_id: runId,
    runs: [
      {
        id: runId,
        started_at: startedAt,
        completed_at: null,
        status: "running",
        candidates_found: 0,
        added: 0,
        skipped_duplicates: 0,
        error: null,
        log_summary: "smoke test in flight",
      },
    ],
  };
  await writeCrawlState(fakeState);
  const readBack = await readCrawlState();
  assert(
    deepEqual(readBack, fakeState),
    `crawl state round-trip mismatch:\n  wrote=${JSON.stringify(fakeState)}\n  read =${JSON.stringify(readBack)}`,
  );
  console.log(`[smoke] crawl state round-trip OK`);

  // ── Interrupted-run recovery ──────────────────────────────────────────
  // ensureSeeded() should detect last_status === "running" with no live
  // work and mark it failed. Simulate a fresh boot by calling it again.
  await ensureSeeded();
  const recovered = await readCrawlState();
  assert(
    recovered.last_status === "failed",
    `expected interrupted run to be marked failed, got "${recovered.last_status}"`,
  );
  assert(
    recovered.current_run_id === null,
    `expected current_run_id cleared, got ${recovered.current_run_id}`,
  );
  assert(
    recovered.runs[0]?.status === "failed",
    `expected run[0].status === "failed"`,
  );
  assert(
    recovered.runs[0]?.error === "interrupted: server restart",
    `expected interrupted error message, got ${recovered.runs[0]?.error}`,
  );
  console.log(`[smoke] interrupted-run recovery OK`);

  // ── Cleanup ───────────────────────────────────────────────────────────
  await fs.rm(tmpRoot, { recursive: true, force: true });
  console.log(`[smoke] PASS`);
}

main().catch((err) => {
  console.error("[smoke] FAIL");
  console.error(err);
  process.exit(1);
});
