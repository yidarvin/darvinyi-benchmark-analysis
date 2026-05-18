// Smoke test for src/lib/merge.ts. Exercises the dedup rules against a
// hand-crafted existing set.
//
// Run via `pnpm test:merge`. Uses Node's built-in type stripping (≥22.6), so
// no tsx/ts-node dependency. Imports are relative — the project's `@/` alias
// only resolves under bundlers, not plain Node.

import { mergeProposals } from "../src/lib/merge.ts";
import type { BenchmarkRecord } from "../src/lib/types.ts";
import type { ProposedBenchmark } from "../src/agent/crawl-agent.ts";

let failures = 0;

function assert(cond: unknown, message: string): void {
  if (!cond) {
    failures += 1;
    console.error(`  FAIL: ${message}`);
  }
}

function check(name: string, fn: () => void): void {
  const before = failures;
  console.log(`\n— ${name}`);
  try {
    fn();
  } catch (err) {
    failures += 1;
    console.error(`  FAIL (threw): ${err instanceof Error ? err.message : String(err)}`);
  }
  if (failures === before) console.log(`  ok`);
}

const existing: BenchmarkRecord[] = [
  {
    id: "mmlu",
    name: "MMLU",
    full_name: "Massive Multitask Language Understanding",
    slug: "mmlu",
    category: "knowledge",
    source_url: "https://arxiv.org/abs/2009.03300",
  },
  {
    id: "gaia",
    name: "GAIA",
    full_name: "General AI Assistants",
    slug: "gaia",
    category: "agentic",
    source_url: "https://huggingface.co/papers/2311.12983",
  },
];

const opts = { runId: "test-run", discoveredAt: "2026-05-18T00:00:00.000Z" };

check("empty proposed input → no-op", () => {
  const r = mergeProposals(existing, [], opts);
  assert(r.merged.length === existing.length, `merged length unchanged, got ${r.merged.length}`);
  assert(r.added.length === 0, `expected 0 added, got ${r.added.length}`);
  assert(r.skipped.length === 0, `expected 0 skipped, got ${r.skipped.length}`);
});

check("brand-new entry → added with crawl envelope", () => {
  const proposed: ProposedBenchmark[] = [
    {
      name: "SWE-Bench Verified",
      short_description: "Curated subset of SWE-Bench with human-verified issue→PR pairs.",
      source_url: "https://www.swebench.com/verified",
      category: "coding",
      year_introduced: 2024,
      notes: "Removes noise from auto-mined issues.",
    },
  ];
  const r = mergeProposals(existing, proposed, opts);
  assert(r.added.length === 1, `expected 1 added, got ${r.added.length}`);
  assert(r.skipped.length === 0, `expected 0 skipped, got ${r.skipped.length}`);
  assert(r.merged.length === existing.length + 1, `expected merged grew by 1`);
  const last = r.merged[r.merged.length - 1];
  assert(last.slug === "swe-bench-verified", `unexpected slug: ${last.slug}`);
  assert(last.id === "swe-bench-verified", `unexpected id: ${last.id}`);
  assert(last.source_url === "https://www.swebench.com/verified", `source_url not copied`);
  assert(last._crawl?.run_id === "test-run", `_crawl.run_id missing`);
  assert(last._crawl?.discovered_at === "2026-05-18T00:00:00.000Z", `_crawl.discovered_at missing`);
  assert(last.description?.short?.startsWith("Curated"), `short description not copied`);
  assert(last.description?.year === 2024, `year_introduced not mapped to description.year`);
});

check("exact-name duplicate → skipped", () => {
  const proposed: ProposedBenchmark[] = [
    {
      name: "MMLU",
      short_description: "Same as existing.",
      source_url: "https://example.com/mmlu",
      category: "knowledge",
      year_introduced: 2020,
      notes: "",
    },
  ];
  const r = mergeProposals(existing, proposed, opts);
  assert(r.added.length === 0, `expected 0 added`);
  assert(r.skipped.length === 1, `expected 1 skipped`);
  assert(r.merged.length === existing.length, `merged should be unchanged`);
});

check("casing / whitespace variance → skipped", () => {
  const proposed: ProposedBenchmark[] = [
    {
      name: "  mmlu  ",
      short_description: "Casing+whitespace variant.",
      source_url: "https://example.com/different",
      category: "knowledge",
      year_introduced: 2020,
      notes: "",
    },
    {
      name: "massive multitask language understanding",
      short_description: "Full-name spelled out.",
      source_url: "https://example.com/other",
      category: "knowledge",
      year_introduced: 2020,
      notes: "",
    },
  ];
  const r = mergeProposals(existing, proposed, opts);
  assert(r.added.length === 0, `expected 0 added, got ${r.added.length}`);
  assert(r.skipped.length === 2, `expected 2 skipped, got ${r.skipped.length}`);
});

check("near-dupe by URL (different name) → skipped", () => {
  const proposed: ProposedBenchmark[] = [
    {
      name: "GAIA-v2",
      short_description: "Same source URL as existing GAIA entry.",
      source_url: "https://huggingface.co/papers/2311.12983/",
      category: "agentic",
      year_introduced: 2024,
      notes: "Trailing slash should still match.",
    },
  ];
  const r = mergeProposals(existing, proposed, opts);
  assert(r.added.length === 0, `expected 0 added, got ${r.added.length}`);
  assert(r.skipped.length === 1, `expected 1 skipped, got ${r.skipped.length}`);
});

check("intra-batch dedup → only first survives", () => {
  const proposed: ProposedBenchmark[] = [
    {
      name: "ARC-AGI-2",
      short_description: "First.",
      source_url: "https://arcprize.org/arc-agi-2",
      category: "reasoning",
      year_introduced: 2025,
      notes: "",
    },
    {
      name: "arc-agi-2",
      short_description: "Second — same name, different URL.",
      source_url: "https://example.com/arc",
      category: "reasoning",
      year_introduced: 2025,
      notes: "",
    },
    {
      name: "ARC AGI Take Two",
      short_description: "Third — different name, same URL as first.",
      source_url: "https://arcprize.org/arc-agi-2",
      category: "reasoning",
      year_introduced: 2025,
      notes: "",
    },
  ];
  const r = mergeProposals(existing, proposed, opts);
  assert(r.added.length === 1, `expected 1 added, got ${r.added.length}`);
  assert(r.skipped.length === 2, `expected 2 skipped, got ${r.skipped.length}`);
  assert(r.merged[r.merged.length - 1].slug === "arc-agi-2", `unexpected slug`);
});

check("merge against empty existing → all added", () => {
  const proposed: ProposedBenchmark[] = [
    {
      name: "Alpha",
      short_description: "a",
      source_url: "https://a.example.com",
      category: "coding",
      year_introduced: 2025,
      notes: "",
    },
    {
      name: "Beta",
      short_description: "b",
      source_url: "https://b.example.com",
      category: "math",
      year_introduced: 2025,
      notes: "",
    },
  ];
  const r = mergeProposals([], proposed, opts);
  assert(r.added.length === 2, `expected 2 added`);
  assert(r.skipped.length === 0, `expected 0 skipped`);
  assert(r.merged.length === 2, `expected merged length 2`);
});

check("existing input array is not mutated", () => {
  const snapshot = JSON.stringify(existing);
  const proposed: ProposedBenchmark[] = [
    {
      name: "Gamma",
      short_description: "g",
      source_url: "https://g.example.com",
      category: "agent",
      year_introduced: 2025,
      notes: "",
    },
  ];
  mergeProposals(existing, proposed, opts);
  assert(JSON.stringify(existing) === snapshot, `existing array was mutated`);
});

if (failures > 0) {
  console.error(`\n[merge:test] FAIL — ${failures} assertion(s)`);
  process.exit(1);
}
console.log(`\n[merge:test] PASS`);
