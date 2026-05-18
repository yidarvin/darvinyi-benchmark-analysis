// Pure deterministic merger for crawl proposals.
//
// Takes the current snake_case `BenchmarkRecord` list (the storage shape on
// /data/benchmarks.json) and a fresh batch of `ProposedBenchmark`s from the
// agent, decides which are genuinely new, and returns the merged list plus
// added/skipped breakdowns. Does not touch disk — the caller does that.
//
// Dedup rules (see context/CRAWL_FEATURE.md §5.3):
//   - normalized name match against existing name / full_name / slug
//   - canonical source_url match against any existing source_url
//   - within the same proposal batch: first occurrence wins

import type { BenchmarkRecord } from "@/lib/types";
import type { ProposedBenchmark } from "@/agent/crawl-agent";

export interface MergeOptions {
  runId?: string;
  // Injection point for tests so the resulting record is deterministic.
  discoveredAt?: string;
}

export interface MergeResult {
  merged: BenchmarkRecord[];
  added: ProposedBenchmark[];
  skipped: ProposedBenchmark[];
}

export function normalizeName(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

// Canonicalize a URL for dedup: lowercased host, strip trailing slash, drop
// `www.` prefix and any query/fragment. Falls back to a normalized string
// when the URL can't be parsed.
export function normalizeUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  const trimmed = u.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const host = url.host.toLowerCase().replace(/^www\./, "");
    let path = url.pathname.replace(/\/+$/, "");
    if (path === "") path = "/";
    return `${url.protocol}//${host}${path}`;
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, "");
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function mergeProposals(
  existing: BenchmarkRecord[],
  proposed: ProposedBenchmark[],
  opts: MergeOptions = {},
): MergeResult {
  const runId = opts.runId ?? "unknown";
  const discoveredAt = opts.discoveredAt ?? new Date().toISOString();

  const existingNames = new Set<string>();
  const existingUrls = new Set<string>();
  const existingSlugs = new Set<string>();
  for (const b of existing) {
    if (b.name) existingNames.add(normalizeName(b.name));
    if (b.full_name) existingNames.add(normalizeName(b.full_name));
    if (b.slug) {
      existingNames.add(normalizeName(b.slug));
      existingSlugs.add(b.slug);
    }
    const url = normalizeUrl(b.source_url);
    if (url) existingUrls.add(url);
  }

  const merged: BenchmarkRecord[] = [...existing];
  const added: ProposedBenchmark[] = [];
  const skipped: ProposedBenchmark[] = [];
  const seenNames = new Set<string>();
  const seenUrls = new Set<string>();

  for (const p of proposed) {
    const nameKey = normalizeName(p.name);
    const urlKey = normalizeUrl(p.source_url);

    if (existingNames.has(nameKey) || seenNames.has(nameKey)) {
      skipped.push(p);
      continue;
    }
    if (urlKey && (existingUrls.has(urlKey) || seenUrls.has(urlKey))) {
      skipped.push(p);
      continue;
    }

    const slug = uniqueSlug(slugify(p.name), existingSlugs);
    const record: BenchmarkRecord = {
      id: slug,
      name: p.name,
      slug,
      category: p.category,
      description: {
        short: p.short_description,
        year: p.year_introduced,
      },
      source_url: p.source_url,
      _crawl: {
        discovered_at: discoveredAt,
        run_id: runId,
        notes: p.notes,
      },
    };

    merged.push(record);
    added.push(p);
    seenNames.add(nameKey);
    if (urlKey) seenUrls.add(urlKey);
    existingSlugs.add(slug);
  }

  return { merged, added, skipped };
}

// In the rare case two proposals slugify to the same value (or collide with
// an existing slug that snuck past the name dedup), suffix with -2, -3, …
function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
