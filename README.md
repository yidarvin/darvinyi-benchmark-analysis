# benchmarks.darvinyi.com

Dark, data-dense explorer for major LLM and agentic-AI benchmarks. Deployed at
[benchmarks.darvinyi.com](https://benchmarks.darvinyi.com).

Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Recharts · pnpm · Railway (Dockerfile).

---

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build (Next.js standalone)
pnpm type-check
```

The site is read-mostly: benchmark detail pages render from `src/data/benchmarks/*.json` at
build time. The agentic crawl feature (below) reads/writes a separate `benchmarks.json` on
a persistent volume.

---

## Agentic crawl

A button in the UI triggers an on-demand crawl: Claude (via `@anthropic-ai/claude-agent-sdk`)
searches the web for new benchmarks, proposes additions, and a deterministic merger writes
genuinely-new ones to the volume-backed `benchmarks.json`.

- **Cooldown:** 24 hours from the *completion* of the previous successful run. The button
  shows a countdown while cooling down. Override with `CRAWL_COOLDOWN_HOURS` in dev.
- **Required env var:** `ANTHROPIC_API_KEY` (set in Railway as a secret).
- **Volume:** Mounted at `/data` in production. On first boot, the bundled
  `benchmarks.json` is copied into the volume; subsequent boots just verify it's present.
- **API routes:** `POST /api/crawl/trigger`, `GET /api/crawl/status`, `GET /api/crawl/runs`.

Full design: [context/CRAWL_FEATURE.md](context/CRAWL_FEATURE.md).
Railway one-time setup: [context/RAILWAY_SETUP.md](context/RAILWAY_SETUP.md).
Smoke test: [scripts/smoke-prod.sh](scripts/smoke-prod.sh).

---

## Deploy

Railway auto-detects the [Dockerfile](Dockerfile); [railway.json](railway.json) pins the
builder, healthcheck, and restart policy. After the first deploy, see
[context/RAILWAY_SETUP.md](context/RAILWAY_SETUP.md) for the volume + env var checklist.
