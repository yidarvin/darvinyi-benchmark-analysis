// Pure deterministic merger for agent-evaluation crawl proposals.
//
// Sister module to `merge.ts`. Operates on `AgentRecord`s (which are
// camelCase `AgentSystem`s with an optional `_crawl` envelope) and matching
// `ProposedAgent`s from the agent crawl. Does not touch disk — the caller
// (the agent crawl trigger route) does that.
//
// Dedup rules (mirror of the benchmark merger):
//   - normalized name match against existing name / slug
//   - canonical URL match against any value in existing `links`
//   - within the same proposal batch: first occurrence wins

import type { AgentRecord, CrawlProvenance } from "@/lib/types";
import type { ProposedAgent } from "@/agent/agent-crawl-agent";

export interface AgentMergeOptions {
  runId?: string;
  discoveredAt?: string;
}

export interface AgentMergeResult {
  merged: AgentRecord[];
  added: ProposedAgent[];
  skipped: ProposedAgent[];
}

function normalizeName(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function normalizeUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  const trimmed = u.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const host = url.host.toLowerCase().replace(/^www\./, "");
    let pathname = url.pathname.replace(/\/+$/, "");
    if (pathname === "") pathname = "/";
    return `${url.protocol}//${host}${pathname}`;
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, "");
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectLinkUrls(links: AgentRecord["links"] | undefined): string[] {
  if (!links) return [];
  return [
    links.paper,
    links.arxiv,
    links.dataset,
    links.leaderboard,
    links.github,
    links.website,
  ].filter((u): u is string => typeof u === "string" && u.length > 0);
}

function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function mergeAgentProposals(
  existing: AgentRecord[],
  proposed: ProposedAgent[],
  opts: AgentMergeOptions = {},
): AgentMergeResult {
  const runId = opts.runId ?? "unknown";
  const discoveredAt = opts.discoveredAt ?? new Date().toISOString();

  const existingNames = new Set<string>();
  const existingUrls = new Set<string>();
  const existingSlugs = new Set<string>();
  for (const a of existing) {
    if (a.name) existingNames.add(normalizeName(a.name));
    if (a.slug) {
      existingNames.add(normalizeName(a.slug));
      existingSlugs.add(a.slug);
    }
    for (const u of collectLinkUrls(a.links)) {
      const normalized = normalizeUrl(u);
      if (normalized) existingUrls.add(normalized);
    }
  }

  const merged: AgentRecord[] = [...existing];
  const added: ProposedAgent[] = [];
  const skipped: ProposedAgent[] = [];
  const seenNames = new Set<string>();
  const seenUrls = new Set<string>();

  for (const p of proposed) {
    const nameKey = normalizeName(p.name);

    if (existingNames.has(nameKey) || seenNames.has(nameKey)) {
      skipped.push(p);
      continue;
    }

    const proposedUrls = collectLinkUrls(p.links)
      .map(normalizeUrl)
      .filter((u): u is string => u !== null);

    const urlCollision = proposedUrls.some(
      (u) => existingUrls.has(u) || seenUrls.has(u),
    );
    if (urlCollision) {
      skipped.push(p);
      continue;
    }

    // Slug collisions (e.g. two different names that slugify to the same
    // value, or a proposal whose slug happens to match an existing entry's)
    // are resolved by suffixing -2/-3/…, not by dropping the proposal.
    const slug = uniqueSlug(p.slug ? slugify(p.slug) : slugify(p.name), existingSlugs);
    const provenance: CrawlProvenance = {
      discovered_at: discoveredAt,
      run_id: runId,
    };
    const record: AgentRecord = {
      ...p,
      slug,
      _crawl: provenance,
    };

    merged.push(record);
    added.push(p);
    seenNames.add(nameKey);
    for (const u of proposedUrls) seenUrls.add(u);
    existingSlugs.add(slug);
  }

  return { merged, added, skipped };
}
