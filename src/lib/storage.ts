import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  AgentRecord,
  AgentsFile,
  AgentSystem,
  BenchmarkRecord,
  BenchmarksFile,
  CrawlState,
} from "@/lib/types";

// Bundled per-agent source of truth — imported here so Next bundles them into
// the standalone build. Used as the seed for $DATA_DIR/agents.json on first
// boot. The crawl writes additions back into the data file, not these.
// Relative paths (not the `@/` alias) plus an explicit `with { type: "json" }`
// attribute so this module is also runnable under plain Node for the smoke
// tests in scripts/.
import mercorApex from "../data/agents/mercor-apex.json" with { type: "json" };
import gdpval from "../data/agents/gdpval.json" with { type: "json" };
import rli from "../data/agents/rli.json" with { type: "json" };
import upworkHapi from "../data/agents/upwork-hapi.json" with { type: "json" };
import metrTimeHorizon from "../data/agents/metr-time-horizon.json" with { type: "json" };
import bigLawBench from "../data/agents/biglaw-bench.json" with { type: "json" };

const BENCHMARKS_FILENAME = "benchmarks.json";
const CRAWL_STATE_FILENAME = "crawl_state.json";
const AGENTS_FILENAME = "agents.json";
const AGENT_CRAWL_STATE_FILENAME = "agent_crawl_state.json";

const DEFAULT_DATA_DIR = "./.data";
const DEFAULT_STATE: CrawlState = {
  last_started_at: null,
  last_completed_at: null,
  last_status: "idle",
  current_run_id: null,
  runs: [],
};

export function dataDir(): string {
  return path.resolve(process.env.DATA_DIR ?? DEFAULT_DATA_DIR);
}

function benchmarksPath(): string {
  return path.join(dataDir(), BENCHMARKS_FILENAME);
}

function crawlStatePath(): string {
  return path.join(dataDir(), CRAWL_STATE_FILENAME);
}

function agentsPath(): string {
  return path.join(dataDir(), AGENTS_FILENAME);
}

function agentCrawlStatePath(): string {
  return path.join(dataDir(), AGENT_CRAWL_STATE_FILENAME);
}

// Single-promise queue per file path. Chains async writers so two concurrent
// callers can't both `rename` over the same target. Reads go through the
// same queue to guarantee they see fully-committed state.
const lockTails = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = lockTails.get(key) ?? Promise.resolve();
  // Run regardless of prior outcome so one failure doesn't poison the queue.
  const next = prev.then(fn, fn);
  lockTails.set(
    key,
    next.catch(() => {}),
  );
  return next;
}

async function atomicWriteJson(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  // Use a pid+random suffix so tmp files don't collide across processes.
  const tmp = `${filePath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  const body = JSON.stringify(value, null, 2);
  await fs.writeFile(tmp, body, "utf8");
  await fs.rename(tmp, filePath);
}

async function readJson<T>(filePath: string): Promise<T> {
  const body = await fs.readFile(filePath, "utf8");
  return JSON.parse(body) as T;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ─── Benchmarks ───────────────────────────────────────────────────────────────

export async function readBenchmarks(): Promise<BenchmarkRecord[]> {
  return withLock(benchmarksPath(), async () => {
    const file = await readJson<BenchmarksFile>(benchmarksPath());
    return file.benchmarks ?? [];
  });
}

export async function readBenchmarksFile(): Promise<BenchmarksFile> {
  return withLock(benchmarksPath(), () =>
    readJson<BenchmarksFile>(benchmarksPath()),
  );
}

export async function writeBenchmarks(list: BenchmarkRecord[]): Promise<void> {
  return withLock(benchmarksPath(), async () => {
    // Preserve the meta block if a file already exists; otherwise stamp a
    // minimal one so the file is self-describing.
    let meta: BenchmarksFile["meta"] = { version: "1.0" };
    if (await fileExists(benchmarksPath())) {
      try {
        const existing = await readJson<BenchmarksFile>(benchmarksPath());
        if (existing?.meta) meta = existing.meta;
      } catch {
        // Corrupt file — fall through to default meta.
      }
    }
    const next: BenchmarksFile = { meta, benchmarks: list };
    await atomicWriteJson(benchmarksPath(), next);
  });
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function readAgents(): Promise<AgentRecord[]> {
  return withLock(agentsPath(), async () => {
    const file = await readJson<AgentsFile>(agentsPath());
    return file.agents ?? [];
  });
}

export async function readAgentsFile(): Promise<AgentsFile> {
  return withLock(agentsPath(), () => readJson<AgentsFile>(agentsPath()));
}

export async function writeAgents(list: AgentRecord[]): Promise<void> {
  return withLock(agentsPath(), async () => {
    let meta: AgentsFile["meta"] = { version: "1.0" };
    if (await fileExists(agentsPath())) {
      try {
        const existing = await readJson<AgentsFile>(agentsPath());
        if (existing?.meta) meta = existing.meta;
      } catch {
        // Corrupt — fall through to default meta.
      }
    }
    await atomicWriteJson(agentsPath(), { meta, agents: list });
  });
}

export async function updateAgents(
  transform: (current: AgentRecord[]) => AgentRecord[] | Promise<AgentRecord[]>,
): Promise<AgentRecord[]> {
  return withLock(agentsPath(), async () => {
    let meta: AgentsFile["meta"] = { version: "1.0" };
    let agents: AgentRecord[] = [];
    if (await fileExists(agentsPath())) {
      try {
        const existing = await readJson<AgentsFile>(agentsPath());
        if (existing?.meta) meta = existing.meta;
        agents = existing?.agents ?? [];
      } catch {
        // Corrupt — start from empty list but keep default meta.
      }
    }
    const next = await transform(agents);
    await atomicWriteJson(agentsPath(), { meta, agents: next });
    return next;
  });
}

// ─── Crawl state ──────────────────────────────────────────────────────────────

export async function readCrawlState(): Promise<CrawlState> {
  return withLock(crawlStatePath(), async () => {
    if (!(await fileExists(crawlStatePath()))) {
      return { ...DEFAULT_STATE, runs: [] };
    }
    return readJson<CrawlState>(crawlStatePath());
  });
}

export async function writeCrawlState(state: CrawlState): Promise<void> {
  return withLock(crawlStatePath(), () =>
    atomicWriteJson(crawlStatePath(), state),
  );
}

// ─── Agent crawl state ────────────────────────────────────────────────────────
// Parallel to the benchmark crawl state but in its own file so the two crawls
// have independent cooldowns and run histories.

export async function readAgentCrawlState(): Promise<CrawlState> {
  return withLock(agentCrawlStatePath(), async () => {
    if (!(await fileExists(agentCrawlStatePath()))) {
      return { ...DEFAULT_STATE, runs: [] };
    }
    return readJson<CrawlState>(agentCrawlStatePath());
  });
}

export async function writeAgentCrawlState(state: CrawlState): Promise<void> {
  return withLock(agentCrawlStatePath(), () =>
    atomicWriteJson(agentCrawlStatePath(), state),
  );
}

export async function updateAgentCrawlState(
  transform: (current: CrawlState) => CrawlState | Promise<CrawlState>,
): Promise<CrawlState> {
  return withLock(agentCrawlStatePath(), async () => {
    let current: CrawlState;
    if (await fileExists(agentCrawlStatePath())) {
      current = await readJson<CrawlState>(agentCrawlStatePath());
    } else {
      current = { ...DEFAULT_STATE, runs: [] };
    }
    const next = await transform(current);
    await atomicWriteJson(agentCrawlStatePath(), next);
    return next;
  });
}

// Read-modify-write the crawl state inside a single lock acquisition. The
// transformer runs with the most recent on-disk state and its return value is
// persisted atomically. Used by the trigger route to check cooldown and flip
// to "running" without a race between two concurrent POSTs.
export async function updateCrawlState(
  transform: (current: CrawlState) => CrawlState | Promise<CrawlState>,
): Promise<CrawlState> {
  return withLock(crawlStatePath(), async () => {
    let current: CrawlState;
    if (await fileExists(crawlStatePath())) {
      current = await readJson<CrawlState>(crawlStatePath());
    } else {
      current = { ...DEFAULT_STATE, runs: [] };
    }
    const next = await transform(current);
    await atomicWriteJson(crawlStatePath(), next);
    return next;
  });
}

// Same pattern for the benchmarks file. Keeps the meta block intact across
// writes.
export async function updateBenchmarks(
  transform: (current: BenchmarkRecord[]) => BenchmarkRecord[] | Promise<BenchmarkRecord[]>,
): Promise<BenchmarkRecord[]> {
  return withLock(benchmarksPath(), async () => {
    let meta: BenchmarksFile["meta"] = { version: "1.0" };
    let benchmarks: BenchmarkRecord[] = [];
    if (await fileExists(benchmarksPath())) {
      try {
        const existing = await readJson<BenchmarksFile>(benchmarksPath());
        if (existing?.meta) meta = existing.meta;
        benchmarks = existing?.benchmarks ?? [];
      } catch {
        // Corrupt — start from empty list but keep default meta.
      }
    }
    const next = await transform(benchmarks);
    await atomicWriteJson(benchmarksPath(), { meta, benchmarks: next });
    return next;
  });
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

// Where to find the bundled seed file. Resolution order:
//   1. $SEED_FILE env (explicit override)
//   2. /app/seed/benchmarks.json (Dockerfile drops it here in the runner stage)
//   3. <cwd>/benchmarks.json     (works in `pnpm dev` from the repo root)
async function resolveSeedPath(): Promise<string | null> {
  const candidates = [
    process.env.SEED_FILE,
    "/app/seed/benchmarks.json",
    path.resolve(process.cwd(), "benchmarks.json"),
  ].filter((p): p is string => Boolean(p));
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

async function seedBenchmarksIfMissing(): Promise<void> {
  const target = benchmarksPath();
  if (await fileExists(target)) {
    console.log(`[seed] benchmarks.json already present at ${target} — skipping seed`);
    return;
  }
  const seed = await resolveSeedPath();
  if (!seed) {
    throw new Error(
      `storage: no benchmarks.json at ${target} and no seed file found ` +
        `(checked $SEED_FILE, /app/seed/benchmarks.json, ${process.cwd()}/benchmarks.json)`,
    );
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  const body = await fs.readFile(seed, "utf8");
  const parsed = JSON.parse(body) as BenchmarksFile;
  await atomicWriteJson(target, parsed);
  console.log(
    `[seed] seeded benchmarks.json from repo copy: ${seed} -> ${target} (${parsed.benchmarks?.length ?? 0} records)`,
  );
}

async function seedCrawlStateIfMissing(): Promise<void> {
  const target = crawlStatePath();
  if (await fileExists(target)) {
    console.log(`[seed] crawl_state.json already present at ${target} — skipping seed`);
    return;
  }
  await atomicWriteJson(target, DEFAULT_STATE);
  console.log(`[seed] initialized empty crawl_state.json at ${target}`);
}

// Bundled agents source — written to $DATA_DIR/agents.json on first boot.
// Cast to AgentRecord[] (a superset of AgentSystem) so the data file's
// shape matches what readAgents() returns. The static JSON is the source
// of truth until the agent crawl writes any additions.
const BUNDLED_AGENTS: AgentRecord[] = [
  mercorApex,
  gdpval,
  rli,
  upworkHapi,
  metrTimeHorizon,
  bigLawBench,
] as AgentSystem[] as AgentRecord[];

async function seedAgentsIfMissing(): Promise<void> {
  const target = agentsPath();
  if (await fileExists(target)) {
    console.log(`[seed] agents.json already present at ${target} — skipping seed`);
    return;
  }
  const payload: AgentsFile = {
    meta: {
      generated: new Date().toISOString().slice(0, 10),
      description:
        "Agent evaluation systems. Seeded from src/data/agents/*.json; extended by the agent crawl.",
      version: "1.0",
    },
    agents: BUNDLED_AGENTS,
  };
  await fs.mkdir(path.dirname(target), { recursive: true });
  await atomicWriteJson(target, payload);
  console.log(
    `[seed] seeded agents.json from bundled imports -> ${target} (${BUNDLED_AGENTS.length} records)`,
  );
}

async function seedAgentCrawlStateIfMissing(): Promise<void> {
  const target = agentCrawlStatePath();
  if (await fileExists(target)) {
    console.log(`[seed] agent_crawl_state.json already present at ${target} — skipping seed`);
    return;
  }
  await atomicWriteJson(target, DEFAULT_STATE);
  console.log(`[seed] initialized empty agent_crawl_state.json at ${target}`);
}

async function recoverInterruptedAgentRun(): Promise<void> {
  const state = await readJson<CrawlState>(agentCrawlStatePath()).catch(
    () => null,
  );
  if (!state) return;
  if (state.last_status !== "running") return;
  const now = new Date().toISOString();
  const runs = state.runs.map((r) =>
    r.id === state.current_run_id && r.status === "running"
      ? {
          ...r,
          status: "failed" as const,
          completed_at: now,
          error: "interrupted: server restart",
        }
      : r,
  );
  const recovered: CrawlState = {
    ...state,
    runs,
    last_status: "failed",
    last_completed_at: now,
    current_run_id: null,
  };
  await atomicWriteJson(agentCrawlStatePath(), recovered);
  console.log(
    `[seed] recovered interrupted agent run ${state.current_run_id} -> marked failed`,
  );
}

// If the process died mid-run, the on-disk state still says "running" with
// a current_run_id but no live work backs it. Roll forward: mark the run
// failed so cooldown logic and the status endpoint can proceed.
async function recoverInterruptedRun(): Promise<void> {
  const state = await readJson<CrawlState>(crawlStatePath()).catch(
    () => null,
  );
  if (!state) return;
  if (state.last_status !== "running") return;
  const now = new Date().toISOString();
  const runs = state.runs.map((r) =>
    r.id === state.current_run_id && r.status === "running"
      ? {
          ...r,
          status: "failed" as const,
          completed_at: now,
          error: "interrupted: server restart",
        }
      : r,
  );
  const recovered: CrawlState = {
    ...state,
    runs,
    last_status: "failed",
    last_completed_at: now,
    current_run_id: null,
  };
  await atomicWriteJson(crawlStatePath(), recovered);
  console.log(
    `[seed] recovered interrupted run ${state.current_run_id} -> marked failed`,
  );
}

export async function ensureSeeded(): Promise<void> {
  console.log(`[seed] ensuring data dir at ${dataDir()}`);
  await fs.mkdir(dataDir(), { recursive: true });
  await withLock(benchmarksPath(), seedBenchmarksIfMissing);
  await withLock(crawlStatePath(), async () => {
    await seedCrawlStateIfMissing();
    await recoverInterruptedRun();
  });
  await withLock(agentsPath(), seedAgentsIfMissing);
  await withLock(agentCrawlStatePath(), async () => {
    await seedAgentCrawlStateIfMissing();
    await recoverInterruptedAgentRun();
  });
}
