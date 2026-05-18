// Smoke test for src/lib/agent-merge.ts. Mirrors scripts/test-merge.ts —
// exercises dedup rules for the agent-evaluation crawl against a hand-crafted
// existing set.
//
// Run via `pnpm test:agent-merge`. Uses Node's built-in type stripping
// (>=22.6), same as the benchmark test. Imports are relative — the project's
// `@/` alias only resolves under bundlers, not plain Node.

import { mergeAgentProposals } from "../src/lib/agent-merge.ts";
import type { AgentRecord } from "../src/lib/types.ts";
import type { ProposedAgent } from "../src/agent/agent-crawl-agent.ts";

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

// Build a minimal valid AgentRecord. Most fields aren't dedup-relevant, so
// fill them with stub strings; only name/slug/links matter for the merger.
function makeRecord(partial: Partial<AgentRecord> & Pick<AgentRecord, "slug" | "name">): AgentRecord {
  return {
    slug: partial.slug,
    name: partial.name,
    shortDescription: partial.shortDescription ?? "x",
    description: partial.description ?? "x",
    creator: partial.creator ?? "x",
    institution: partial.institution ?? "x",
    year: partial.year ?? 2025,
    tags: partial.tags ?? [],
    isRequired: partial.isRequired ?? false,
    stats: partial.stats ?? {
      totalTasks: 0,
      domains: [],
      evaluationMethod: "x",
      primaryMetric: "x",
    },
    taskAnatomy: partial.taskAnatomy ?? {
      setup: "x",
      input: "x",
      output: "x",
      evaluation: "x",
      metric: "x",
    },
    examples: partial.examples ?? [],
    results: partial.results ?? [],
    links: partial.links ?? {},
  };
}

function makeProposal(
  partial: Partial<ProposedAgent> & Pick<ProposedAgent, "slug" | "name">,
): ProposedAgent {
  return makeRecord(partial) as ProposedAgent;
}

const existing: AgentRecord[] = [
  makeRecord({
    slug: "rli",
    name: "Remote Labor Index (RLI)",
    links: { website: "https://www.safe.ai/rli", paper: "https://arxiv.org/abs/2510.99999" },
  }),
  makeRecord({
    slug: "biglaw-bench",
    name: "BigLaw Bench",
    links: { website: "https://harvey.ai/research/biglaw-bench" },
  }),
];

const opts = { runId: "test-run", discoveredAt: "2026-05-18T00:00:00.000Z" };

check("empty proposed input → no-op", () => {
  const r = mergeAgentProposals(existing, [], opts);
  assert(r.merged.length === existing.length, `merged length unchanged`);
  assert(r.added.length === 0, `expected 0 added`);
  assert(r.skipped.length === 0, `expected 0 skipped`);
});

check("brand-new entry → added with crawl envelope", () => {
  const proposed: ProposedAgent[] = [
    makeProposal({
      slug: "swe-rebench",
      name: "SWE-Rebench",
      links: { paper: "https://arxiv.org/abs/2511.00001" },
    }),
  ];
  const r = mergeAgentProposals(existing, proposed, opts);
  assert(r.added.length === 1, `expected 1 added, got ${r.added.length}`);
  assert(r.merged.length === existing.length + 1, `expected merged grew by 1`);
  const last = r.merged[r.merged.length - 1];
  assert(last.slug === "swe-rebench", `unexpected slug: ${last.slug}`);
  assert(last._crawl?.run_id === "test-run", `_crawl.run_id missing`);
  assert(
    last._crawl?.discovered_at === "2026-05-18T00:00:00.000Z",
    `_crawl.discovered_at missing`,
  );
});

check("exact-name duplicate → skipped", () => {
  const proposed: ProposedAgent[] = [
    makeProposal({
      slug: "biglaw-bench-v2",
      name: "BigLaw Bench",
      links: { website: "https://example.com/something-else" },
    }),
  ];
  const r = mergeAgentProposals(existing, proposed, opts);
  assert(r.added.length === 0, `expected 0 added`);
  assert(r.skipped.length === 1, `expected 1 skipped`);
});

check("casing/whitespace name variance → skipped", () => {
  const proposed: ProposedAgent[] = [
    makeProposal({
      slug: "rli-clone",
      name: "  remote labor index (RLI)  ",
      links: { website: "https://example.com/x" },
    }),
  ];
  const r = mergeAgentProposals(existing, proposed, opts);
  assert(r.added.length === 0, `expected 0 added`);
  assert(r.skipped.length === 1, `expected 1 skipped`);
});

check("URL collision with existing links (trailing slash) → skipped", () => {
  const proposed: ProposedAgent[] = [
    makeProposal({
      slug: "harvey-bench",
      name: "Harvey Bench",
      links: { website: "https://harvey.ai/research/biglaw-bench/" },
    }),
  ];
  const r = mergeAgentProposals(existing, proposed, opts);
  assert(r.added.length === 0, `expected 0 added`);
  assert(r.skipped.length === 1, `expected 1 skipped`);
});

check("slug collision with existing → suffix applied", () => {
  const proposed: ProposedAgent[] = [
    makeProposal({
      slug: "rli",
      name: "Some Other Eval With Conflicting Slug",
      links: { website: "https://example.com/distinct" },
    }),
  ];
  const r = mergeAgentProposals(existing, proposed, opts);
  assert(r.added.length === 1, `expected 1 added`);
  const last = r.merged[r.merged.length - 1];
  assert(last.slug === "rli-2", `expected slug rli-2, got ${last.slug}`);
});

check("intra-batch dedup → only first survives", () => {
  const proposed: ProposedAgent[] = [
    makeProposal({
      slug: "agentbench-pro",
      name: "AgentBench Pro",
      links: { website: "https://example.com/agentbench-pro" },
    }),
    makeProposal({
      slug: "agentbench-pro-2",
      name: "agentbench pro",
      links: { website: "https://example.com/other" },
    }),
    makeProposal({
      slug: "agentbench-pro-3",
      name: "AgentBench Pro Take Two",
      links: { website: "https://example.com/agentbench-pro" },
    }),
  ];
  const r = mergeAgentProposals(existing, proposed, opts);
  assert(r.added.length === 1, `expected 1 added, got ${r.added.length}`);
  assert(r.skipped.length === 2, `expected 2 skipped, got ${r.skipped.length}`);
  assert(
    r.merged[r.merged.length - 1].slug === "agentbench-pro",
    `unexpected slug`,
  );
});

check("merge against empty existing → all added", () => {
  const proposed: ProposedAgent[] = [
    makeProposal({ slug: "alpha", name: "Alpha", links: { website: "https://a.test" } }),
    makeProposal({ slug: "beta", name: "Beta", links: { website: "https://b.test" } }),
  ];
  const r = mergeAgentProposals([], proposed, opts);
  assert(r.added.length === 2, `expected 2 added`);
  assert(r.merged.length === 2, `expected merged length 2`);
});

check("existing input array is not mutated", () => {
  const snapshot = JSON.stringify(existing);
  const proposed: ProposedAgent[] = [
    makeProposal({
      slug: "gamma",
      name: "Gamma",
      links: { website: "https://g.test" },
    }),
  ];
  mergeAgentProposals(existing, proposed, opts);
  assert(JSON.stringify(existing) === snapshot, `existing array was mutated`);
});

if (failures > 0) {
  console.error(`\n[agent-merge:test] FAIL — ${failures} assertion(s)`);
  process.exit(1);
}
console.log(`\n[agent-merge:test] PASS`);
