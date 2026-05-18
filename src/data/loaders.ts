// Server-only async loaders that read the live data files from `$DATA_DIR`,
// so crawl-discovered records show up on subsequent requests without a
// rebuild. Wrapped in React's `cache()` for per-request memoization: a single
// page render that calls `loadAgents()` multiple times only hits storage once,
// but the next request gets a fresh read.
//
// Pair with `src/data/index.ts` which still exports build-time bundles for
// the curated rich `Benchmark` shape. Crawl-added benchmarks land on disk as
// sparse `BenchmarkRecord`s; `loadBenchmarkCardItems()` merges the two so the
// list page can render both kinds without the bundled cards getting downgraded
// to the sparse shape.

import { cache } from "react";

import { ALL_BENCHMARKS, BENCHMARK_MAP } from "@/data";
import {
  ensureSeeded,
  latestSuccessfulRunId,
  readAgentCrawlState,
  readAgents,
  readBenchmarks,
  readCrawlState,
} from "@/lib/storage";
import type {
  AgentRecord,
  AgentSystem,
  BenchmarkCardItem,
  BenchmarkCardStub,
  BenchmarkRecord,
} from "@/lib/types";

// AgentRecord extends AgentSystem with an optional `_crawl` envelope. Renders
// only consume AgentSystem fields, so the cast is safe.
export const loadAgents = cache(async (): Promise<AgentSystem[]> => {
  await ensureSeeded();
  const records: AgentRecord[] = await readAgents();
  return records as AgentSystem[];
});

export const loadAgentMap = cache(
  async (): Promise<Record<string, AgentSystem>> => {
    const agents = await loadAgents();
    return Object.fromEntries(agents.map((a) => [a.slug, a]));
  },
);

// Underlying AgentRecord list (preserves `_crawl` so the page can tag NEW).
const loadAgentRecords = cache(async (): Promise<AgentRecord[]> => {
  await ensureSeeded();
  return readAgents();
});

// Returns the `_crawl.run_id` that should be treated as "the latest batch".
// Null when no successful crawl has run yet — every record's `isNew` will be
// false in that case.
export const loadAgentLatestRunId = cache(async (): Promise<string | null> => {
  await ensureSeeded();
  const state = await readAgentCrawlState();
  return latestSuccessfulRunId(state);
});

// Agents tagged with isNew based on whether their `_crawl.run_id` matches the
// most recent successful agent-crawl run.
export const loadAgentCardItems = cache(
  async (): Promise<Array<{ agent: AgentSystem; isNew: boolean }>> => {
    const [records, latestRunId] = await Promise.all([
      loadAgentRecords(),
      loadAgentLatestRunId(),
    ]);
    return records.map((r) => ({
      agent: r as AgentSystem,
      isNew: latestRunId !== null && r._crawl?.run_id === latestRunId,
    }));
  },
);

// ─── Benchmarks ───────────────────────────────────────────────────────────────

// Returns the slug→stub map for crawl-added benchmarks, filtered to exclude
// anything already in the bundled (curated) set — curated wins on slug
// collision because it has 30 hand-curated fields vs. the crawl's 6.
async function loadBenchmarkStubsBySlug(): Promise<
  Map<string, BenchmarkRecord>
> {
  await ensureSeeded();
  const records = await readBenchmarks();
  const stubs = new Map<string, BenchmarkRecord>();
  for (const r of records) {
    if (!r.slug) continue;
    if (BENCHMARK_MAP[r.slug]) continue;
    stubs.set(r.slug, r);
  }
  return stubs;
}

export const loadBenchmarkLatestRunId = cache(
  async (): Promise<string | null> => {
    await ensureSeeded();
    const state = await readCrawlState();
    return latestSuccessfulRunId(state);
  },
);

function toBenchmarkStub(
  record: BenchmarkRecord,
  latestRunId: string | null,
): BenchmarkCardStub {
  const year =
    typeof record.description?.year === "number"
      ? record.description.year
      : null;
  return {
    kind: "crawl-stub",
    slug: record.slug,
    name: record.name,
    shortDescription:
      typeof record.description?.short === "string"
        ? record.description.short
        : "",
    category: typeof record.category === "string" ? record.category : "",
    year,
    sourceUrl: typeof record.source_url === "string" ? record.source_url : null,
    notes: record._crawl?.notes ?? null,
    isNew: latestRunId !== null && record._crawl?.run_id === latestRunId,
  };
}

// Merge: bundled benchmarks (always isNew=false; curated set is hand-edited)
// + crawl-only stubs. Order is bundled first, then stubs at the end — the
// page's own sort takes over for any sort other than default.
export const loadBenchmarkCardItems = cache(
  async (): Promise<BenchmarkCardItem[]> => {
    const [stubsBySlug, latestRunId] = await Promise.all([
      loadBenchmarkStubsBySlug(),
      loadBenchmarkLatestRunId(),
    ]);
    const fulls: BenchmarkCardItem[] = ALL_BENCHMARKS.map((b) => ({
      kind: "full",
      benchmark: b,
      isNew: false,
    }));
    const stubs: BenchmarkCardItem[] = Array.from(stubsBySlug.values()).map(
      (r) => toBenchmarkStub(r, latestRunId),
    );
    return [...fulls, ...stubs];
  },
);

// Detail-page resolver. Returns either the curated Benchmark, a stub for
// crawl-added entries, or null when neither matches.
export const loadBenchmarkBySlug = cache(
  async (slug: string): Promise<BenchmarkCardItem | null> => {
    const bundled = BENCHMARK_MAP[slug];
    if (bundled) {
      return { kind: "full", benchmark: bundled, isNew: false };
    }
    const [stubsBySlug, latestRunId] = await Promise.all([
      loadBenchmarkStubsBySlug(),
      loadBenchmarkLatestRunId(),
    ]);
    const record = stubsBySlug.get(slug);
    if (!record) return null;
    return toBenchmarkStub(record, latestRunId);
  },
);
