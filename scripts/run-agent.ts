// Dry-run harness for src/agent/crawl-agent.ts.
//
// Loads existing benchmarks from the configured DATA_DIR (auto-seeding if
// empty), runs the crawl agent against the live ANTHROPIC_API_KEY, and
// pretty-prints the proposed candidates. NEVER writes back to disk — that
// belongs to the API route + merger added in a later session.
//
// Run with: `pnpm agent:dry-run`. Uses Node's native TS-stripping (≥22.6),
// so no tsx/ts-node dependency. Imports use relative paths because `@/`
// only resolves under the Next.js bundler.

import path from "node:path";

import { ensureSeeded, readBenchmarks } from "../src/lib/storage.ts";
import { runCrawlAgent, AgentOutputError } from "../src/agent/crawl-agent.ts";
import type { ProgressEvent } from "../src/agent/crawl-agent.ts";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "[agent:dry-run] ANTHROPIC_API_KEY is not set. Export it before running.",
    );
    process.exit(1);
  }

  // Default the seed path to the repo's bundled benchmarks.json so a fresh
  // checkout works without poking at /data. SEED_FILE overrides this.
  if (!process.env.SEED_FILE) {
    process.env.SEED_FILE = path.resolve(
      process.cwd(),
      "benchmarks.json",
    );
  }

  console.log(`[agent:dry-run] DATA_DIR=${process.env.DATA_DIR ?? "./.data"}`);
  console.log(`[agent:dry-run] SEED_FILE=${process.env.SEED_FILE}`);

  await ensureSeeded();
  const existing = await readBenchmarks();
  console.log(`[agent:dry-run] loaded ${existing.length} existing benchmarks`);

  const start = Date.now();
  const onProgress = (event: ProgressEvent) => {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1).padStart(6, " ");
    console.log(`[+${elapsed}s] ${event.type.padEnd(15)} ${event.message}`);
  };

  let result;
  try {
    result = await runCrawlAgent({ existingBenchmarks: existing, onProgress });
  } catch (err) {
    if (err instanceof AgentOutputError) {
      console.error(`\n[agent:dry-run] FAILED: ${err.message}`);
      console.error("--- offending text ---");
      console.error(err.offendingText);
      console.error("----------------------");
    } else {
      console.error(`\n[agent:dry-run] FAILED:`, err);
    }
    process.exit(2);
  }

  console.log(
    `\n[agent:dry-run] proposed ${result.proposed_benchmarks.length} candidate(s)`,
  );
  console.log(`reasoning: ${result.reasoning_summary}\n`);

  for (const [i, b] of result.proposed_benchmarks.entries()) {
    console.log(`  ${i + 1}. ${b.name}  [${b.category}, ${b.year_introduced}]`);
    console.log(`     ${b.short_description}`);
    console.log(`     ${b.source_url}`);
    if (b.notes) console.log(`     notes: ${b.notes}`);
    console.log("");
  }

  console.log("--- raw log ---");
  console.log(result.raw_log);
  console.log("---------------");
  console.log("[agent:dry-run] OK (no files written)");
}

main().catch((err) => {
  console.error("[agent:dry-run] UNEXPECTED:", err);
  process.exit(1);
});
