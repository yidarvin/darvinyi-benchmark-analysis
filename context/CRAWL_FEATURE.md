# Agentic Benchmark Crawl — Design Doc

> Single source of truth for the multi-session build of the **crawl** feature
> on top of the existing Next.js 15 / Railway / Dockerfile site at
> `benchmarks.darvinyi.com`. Every subsequent session reads this file first.
>
> **Status:** Session 1 — discovery & design only. No source code changes.

---

## 1. Goal

Add an authenticated-from-the-server **agentic crawl** that, on demand,
asks Claude (via `@anthropic-ai/claude-agent-sdk`) to discover new
LLM/agent benchmarks, then deterministically merges any genuinely new
proposals into the site's benchmark dataset.

The crawl is **operator-triggered** (a button somewhere in the UI),
**asynchronous** (fire-and-forget on the server, client polls), and
**rate-limited** (24-hour cooldown after a *successful* completion).

---

## 2. Current repo inventory (relevant bits)

| Path | Role |
|------|------|
| `package.json` | Next.js `16.2.4`, React 19, Tailwind v4, **pnpm**, no agent SDK yet |
| `next.config.ts` | `output: "standalone"` — required for the slim Docker runner |
| `Dockerfile` | 3-stage: `deps` → `builder` → `runner` on `node:22-alpine`, runs as `nextjs` user |
| `pnpm-workspace.yaml` | `allowBuilds: { sharp, unrs-resolver }` |
| `benchmarks.json` (repo root) | **Rich research dump** — 96 KB, deeply nested per-benchmark records (description, task_anatomy, example_tasks, statistics, leaderboard, controversies, …) |
| `src/data/benchmarks/*.json` | **Per-benchmark site data** (typed by `src/lib/types.ts:Benchmark`) — these are what the UI actually renders today, NOT `benchmarks.json` |
| `src/data/index.ts` | Bundles all benchmarks at build time via `import x from "./benchmarks/x.json"` |
| `src/app/benchmarks/page.tsx` | Reads `ALL_BENCHMARKS` (build-time bundle) |
| `frontier_model_benchmarks.md` | Source research the seed JSON was derived from |

### 2.1 `benchmarks.json` schema (top-level, the file we'll persist)

```jsonc
{
  "meta": { "generated": "YYYY-MM-DD", "description": "...", "version": "1.0" },
  "benchmarks": [
    {
      "id": "gaia",
      "name": "GAIA",
      "full_name": "General AI Assistants",
      "slug": "gaia",
      "category": "agentic",
      "tags": ["agent", "multi-step", "tool-use", "web-browsing"],
      "description": { "short": "...", "full": "...", "motivation": "...", "creators": "...", "year": 2023 },
      "task_anatomy": { /* nested */ },
      "example_tasks": [ /* … */ ],
      "statistics":   { /* … */ },
      "leaderboard":  { /* … */ },
      "saturation":   { /* … */ },
      "controversies":[ /* … */ ]
    }
  ]
}
```

Field names are `snake_case` here, in contrast to the `camelCase`
`src/lib/types.ts:Benchmark` shape used by the rendered site. **These
two schemas are not the same** — see Open Question Q1.

### 2.2 Reference agent (cloned mentally from `yidarvin/darvinyi-research-topic`)

`server/src/agent/` from that repo gives us the exact pattern:

- Package: `@anthropic-ai/claude-agent-sdk` `^0.3.143` + `@anthropic-ai/sdk` `^0.96.0`
- Construction:

  ```ts
  import { query } from "@anthropic-ai/claude-agent-sdk";

  const iterator = query({
    prompt: initialPrompt,
    options: {
      model,                            // e.g. "claude-sonnet-4-6"
      systemPrompt,
      maxTurns,                         // capped (their cap: 200)
      mcpServers: { "research-tools": mcpServer },
      allowedTools: [ /* mcp__research-tools__* */ ],
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      abortController,
      env: { ...process.env, ANTHROPIC_API_KEY: apiKey },
    },
  });
  ```

- Collection: `for await (const message of iterator)` — captures
  `message.type === "assistant"` text blocks into a buffer, looks for a
  delimited block (`<synthesis>…</synthesis>` in their case) at the end.
- Cancellation: external `AbortSignal` → internal `AbortController` →
  passed into `query` options.
- Errors: try/catch around the iterator; final cleanup in `finally`.
- Model config lives in `server/src/agent/config.ts` with a `maxTurnsCap`.

We will mirror this shape, swapping the MCP toolset for built-in
**WebSearch** (and possibly **WebFetch**) so the agent can actually find
new benchmarks on the live web. See Open Question Q4.

---

## 3. Persistence plan

### 3.1 Volume layout

Railway Volume mounted at `/data` (override-able via `DATA_DIR`):

```
/data/
  benchmarks.json    # The rich dataset — source of truth post-bootstrap
  crawl_state.json   # Crawl history + cooldown bookkeeping
```

Reads/writes happen exclusively via a small `src/lib/storage.ts` helper
(to be built in Session 2), which:

- Resolves `process.env.DATA_DIR ?? "/data"`.
- Does atomic writes: write to `*.tmp`, then `fs.rename` (same fs, so
  atomic).
- Wraps every mutation in a single in-process mutex so `trigger`,
  `status`, and the agent's writer can't interleave.

### 3.2 `crawl_state.json` schema

```jsonc
{
  "last_started_at":   "2026-05-18T14:23:00.000Z" | null,
  "last_completed_at": "2026-05-18T14:31:42.000Z" | null,
  "last_status":       "idle" | "running" | "success" | "failed",
  "current_run_id":    "uuid-of-running-run"      | null,
  "runs": [
    {
      "id":                  "uuid",
      "started_at":          "ISO-8601",
      "completed_at":        "ISO-8601 | null",
      "status":              "running" | "success" | "failed",
      "candidates_found":    0,
      "added":               0,
      "skipped_duplicates":  0,
      "error":               "string | null",
      "log_summary":         "short human-readable summary"
    }
  ]
}
```

Invariants:

- `runs` is **append-only with cap 20** — when length exceeds 20, drop
  the oldest. Newest first or oldest first → pick newest-first so
  `runs[0]` is the most recent (cheaper for the status endpoint).
- `current_run_id` is non-null **iff** `last_status === "running"`.
- Whenever a run terminates (success or failure), update
  `last_completed_at`, `last_status`, `current_run_id = null`, and the
  matching entry inside `runs`.

### 3.3 Bootstrap rule

On first server start *for any request that touches `/data/benchmarks.json`*:

1. If `/data/benchmarks.json` exists → no-op.
2. Else: copy the repo's `benchmarks.json` (bundled into the Docker
   image at a known path — e.g. `/app/seed/benchmarks.json`) to
   `/data/benchmarks.json`.

After bootstrap, **the volume is the source of truth**. The bundled
seed file in the image is never read again.

`crawl_state.json` is bootstrapped lazily the same way, defaulting to:

```json
{ "last_started_at": null, "last_completed_at": null,
  "last_status": "idle", "current_run_id": null, "runs": [] }
```

> **Docker note (for Session 2 only):** the existing Dockerfile
> currently doesn't copy `benchmarks.json` into the image. The Session-2
> implementer will need to either (a) add a `COPY benchmarks.json
> /app/seed/benchmarks.json` step, or (b) keep the seed at the repo
> root and let `next start`'s working directory pick it up. **Do not
> modify the Dockerfile in Session 1.**

---

## 4. Cooldown contract

```
POST /api/crawl/trigger
```

1. Load `crawl_state.json` (bootstrap if missing).
2. If `last_status === "running"` → return **409 Conflict** with
   `{ run_id: current_run_id }`.
3. Else if `last_completed_at` is non-null AND
   `Date.now() - Date.parse(last_completed_at) < 24 * 60 * 60 * 1000`:
   - Compute `retry_after_seconds = Math.ceil((24*60*60*1000 - elapsed) / 1000)`.
   - Return **429 Too Many Requests** with header
     `Retry-After: <retry_after_seconds>` and body
     `{ retry_after_seconds, last_completed_at }`.
4. Otherwise: proceed (see §6 Async pattern).

The 24-hour clock starts at **completion**, not at trigger time, so a
slow run doesn't burn cooldown.

---

## 5. Agent contract

The agent does **not** write files. It returns a single JSON block; a
deterministic merger decides what to persist.

### 5.1 Output type

```ts
type ProposedBenchmark = {
  name: string;              // e.g. "MMMU-Pro"
  short_description: string; // ≤ 280 chars
  source_url: string;        // canonical URL (paper, GitHub, leaderboard)
  category: string;          // free-form; merger normalizes
  year_introduced: number;   // integer year
  notes: string;             // why it matters / what it tests
};

type AgentOutput = {
  proposed_benchmarks: ProposedBenchmark[];
  reasoning_summary: string; // 1–3 sentence summary of the search trail
};
```

### 5.2 Delivery format

Agent must emit a single fenced block, delimited so we can extract it
robustly without a JSON parser fight with assistant prose:

```
<crawl_output>
{ "proposed_benchmarks": [ … ], "reasoning_summary": "…" }
</crawl_output>
```

Extractor regex: `/<crawl_output>([\s\S]*?)<\/crawl_output>/`, then
`JSON.parse` and `zod`-validate (zod is already proven in the reference
repo).

### 5.3 Deterministic merge

After parsing:

1. **Canonicalize names**: lowercase, trim, strip punctuation,
   collapse whitespace. Both incoming `name` and existing
   `benchmarks[].name` / `benchmarks[].full_name` / `benchmarks[].slug`
   go through the same normalizer.
2. For each proposed benchmark:
   - If canonical name matches any existing entry → increment
     `skipped_duplicates`.
   - Else → push a **minimal new record** onto `benchmarks[]`:

     ```jsonc
     {
       "id":   "<slugified-name>",
       "name": "<original name>",
       "slug": "<slugified-name>",
       "category": "<as-proposed>",
       "description": { "short": "<short_description>", "year": <year_introduced> },
       "source_url": "<source_url>",
       "_crawl": {
         "discovered_at": "ISO-8601",
         "run_id": "<run-uuid>",
         "notes": "<notes>"
       }
     }
     ```

     The `_crawl` envelope keeps crawl provenance separate from the
     rich human-curated fields. Records added by the crawl will be
     visually distinguishable in any future UI (e.g. a "discovered"
     badge). See Open Question Q1 / Q2.
3. Update counters on the run entry; persist `benchmarks.json` and
   `crawl_state.json` (in that order — benchmarks first, state second,
   so a crash never claims a run "added N" without those records
   existing on disk).

The agent never sees the existing list directly. We rely on its web
research + name dedup to avoid duplicates. Cost of a false negative is
small (one row to delete by hand); cost of a false positive is zero.

---

## 6. Async pattern (fire-and-forget in App Router)

Next.js App Router route handlers are short-lived by default, but for
fire-and-forget we can intentionally **not await** the long-running
promise before returning:

```ts
// app/api/crawl/trigger/route.ts (sketch — Session 3 will implement)
export async function POST() {
  const state = await loadState();
  // … cooldown checks …
  const runId = crypto.randomUUID();
  await markRunning(runId);                    // writes crawl_state.json
  void runCrawl(runId).catch(async (err) => {  // intentionally unawaited
    await markFailed(runId, err);
  });
  return Response.json({ run_id: runId }, { status: 202 });
}
```

Risks and mitigations:

- **Process recycling**: Railway can recycle the container. If the
  process dies mid-run, on next start the bootstrap routine will see
  `last_status === "running"` with a stale `current_run_id` and no
  matching live work. The recovery step: on app boot, if state says
  `running`, rewrite it to `failed` with
  `error: "interrupted: server restart"` and update the matching run
  entry. Implement in Session 2's storage helper.
- **Concurrent triggers**: the 409-on-running check above prevents
  double-fire from racing clients.
- **Logging**: the agent's per-turn text is captured into the run's
  `log_summary` (truncate to ~2 KB to keep the state file small).

### 6.1 Client polling

Client triggers, gets `{ run_id }`, then `GET /api/crawl/status` every
~3 s until `last_status !== "running"`. The status response also
carries `cooldown_remaining_seconds` so the UI can render a countdown
button.

---

## 7. API surface

| Method | Path | Success | Failure |
|---|---|---|---|
| `POST` | `/api/crawl/trigger` | `202 { run_id }` | `409 { run_id }` if running; `429 { retry_after_seconds, last_completed_at }` + `Retry-After` header if cooling down |
| `GET`  | `/api/crawl/status`  | `200 { last_status, current_run_id, last_started_at, last_completed_at, cooldown_remaining_seconds, latest_run }` | — |
| `GET`  | `/api/crawl/runs`    | `200 { runs: RunSummary[] }` (last 20, newest first) | — |

All three handlers live under `src/app/api/crawl/`. They are **server
routes** (`runtime: "nodejs"`, not edge — we need `fs` and a
long-lived subprocess for the agent).

No auth on these endpoints in v1 — the site is public and the only
cost is the API key burn, gated by cooldown. Open Question Q5.

---

## 8. Environment variables (Railway)

| Name | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes | — | Passed into the agent SDK `query()` `env` option |
| `DATA_DIR`          | no  | `/data` | Volume mount root |
| `CRAWL_MODEL`       | no  | `claude-sonnet-4-6` | Override default agent model |
| `CRAWL_MAX_TURNS`   | no  | `40` | Per-run turn cap (mirrors reference repo's `AGENT_CONFIG.maxTurnsCap` pattern) |
| `CRAWL_COOLDOWN_HOURS` | no | `24` | For dev/staging where you want a shorter cooldown |

These get configured in Railway's dashboard before Session 6.
Dockerfile already runs as the unprivileged `nextjs` user; the
volume mount must be writable by uid `1001`.

---

## 9. Open questions (need user confirmation before Session 3)

1. **Two-schema problem.** The rendered site reads typed
   `src/data/benchmarks/*.json` (camelCase, fully populated) at build
   time. `/data/benchmarks.json` is the snake_case research dump. Should
   we (a) keep them disjoint and add a separate "Recently discovered"
   page that reads `/data/benchmarks.json` at runtime, (b) migrate the
   site to read everything from `/data/benchmarks.json` (large refactor),
   or (c) treat `/data/benchmarks.json` as a staging queue that a human
   reviews before promotion into the typed per-benchmark files?

2. **Minimal merge record shape.** The merge writes a partial record
   with most rich fields missing. Confirm the `_crawl` envelope
   approach is acceptable rather than synthesizing empty values for
   every nested field.

3. **Dedup signal beyond name.** Many benchmarks have aliases (e.g.
   "MMLU" vs "Massive Multitask Language Understanding"). Should the
   merger also dedup against `full_name` and `source_url`? Default
   plan: yes for `full_name`; URL-based dedup needs canonicalization
   (strip query, trailing slash, etc.).

4. **Tools given to the agent.** The reference agent uses MCP tools
   wired to Semantic Scholar / arXiv. For benchmark crawling, the
   built-in **WebSearch** + **WebFetch** are likely sufficient and
   simpler. Confirm we don't need a custom MCP server in v1.

5. **No auth on the endpoints?** Anyone hitting `POST /api/crawl/trigger`
   on the public site can spend the API key (up to once per 24 h).
   Cooldown is the only guardrail. Acceptable for v1, or do we want a
   shared-secret header check (env var `CRAWL_TRIGGER_TOKEN`)?

6. **Where is the trigger button in the UI?** Footer? A new
   `/admin/crawl` page? Or fully invisible (curl only)? This affects
   Session 4/5 scope.

7. **Per-run cost cap.** The agent SDK has `maxTurns` but no built-in
   token-cost cap. Do we want to also enforce a `max_input_tokens` or
   `max_cost_usd` heuristic, or trust `maxTurns=40` as enough?

8. **Run history view (`GET /api/crawl/runs`).** Should this also be
   surfaced as a UI page (`/crawl/history`), or kept JSON-only for v1?
