// Server-only async loaders that read the live data files from `$DATA_DIR`,
// so crawl-discovered records show up on subsequent requests without a
// rebuild. Wrapped in React's `cache()` for per-request memoization: a single
// page render that calls `loadAgents()` multiple times only hits storage once,
// but the next request gets a fresh read.
//
// Pair with `src/data/index.ts` which still exports build-time bundles for
// any code path that needs synchronous access at build (currently just the
// LLM benchmark pages, until the LLM crawl migrates to the camelCase shape).

import { cache } from "react";

import { ensureSeeded, readAgents } from "@/lib/storage";
import type { AgentRecord, AgentSystem } from "@/lib/types";

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
