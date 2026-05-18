# Railway Setup Checklist — Agentic Crawl Feature

> One-time manual steps to get the crawl feature live at https://benchmarks.darvinyi.com.
> The Dockerfile, `railway.json`, and seed logic are already wired; this is the dashboard
> work that has to happen in the Railway UI.

---

## 1. Volume

The crawl writes `benchmarks.json` and `crawl_state.json` to `/data`. Without a mounted
volume, every redeploy wipes the discovered benchmarks and the cooldown state.

- [ ] In the Railway service, open **Settings → Volumes**.
- [ ] **Add Volume**:
  - Mount path: `/data`
  - Size: `1 GB`
- [ ] Confirm the volume shows as "attached" after the next deploy.

> The Dockerfile runs the app as user `nextjs` (uid `1001`). Railway volumes are
> writable by the container user by default, so no extra chmod step is needed.

---

## 2. Environment variables

In **Settings → Variables**:

- [ ] **`ANTHROPIC_API_KEY`** — set to a valid Anthropic API key. Mark as **secret**
      (sealed) so it isn't echoed in logs or shown to teammates.
- [ ] **`DATA_DIR`** — *optional*. The Dockerfile already sets `DATA_DIR=/data`, so you
      only need this if you want to override the mount path. Leave unset in normal use.
- [ ] **`CRAWL_MODEL`** — *optional*. Defaults to `claude-sonnet-4-6`. Override only if
      you want a different model.
- [ ] **`CRAWL_MAX_TURNS`** — *optional*. Defaults to `40`.
- [ ] **`CRAWL_COOLDOWN_HOURS`** — *optional*. Defaults to `24`. Lower it for dev/staging
      if you want to test the trigger more than once a day.

---

## 3. Domain

- [ ] Confirm the **public domain** `benchmarks.darvinyi.com` still routes to this
      service after the deploy (Railway → **Settings → Networking → Domains**).
- [ ] Optional but recommended: verify the auto-generated `*.up.railway.app` URL works
      too, as a fallback for the smoke test.

---

## 4. First-deploy verification

Once the deploy goes green:

- [ ] Open the service's **Logs** tab and look for the seed lines:
  ```
  [seed] ensuring data dir at /data
  [seed] seeded benchmarks.json from repo copy: /app/seed/benchmarks.json -> /data/benchmarks.json (N records)
  [seed] initialized empty crawl_state.json at /data/crawl_state.json
  ```
  On subsequent deploys these turn into `… already present at /data/… — skipping seed`,
  which proves the volume is persisting state across restarts.

- [ ] Run the smoke test from your laptop:
  ```
  scripts/smoke-prod.sh
  ```
  Expected: a JSON body with `last_status`, `cooldown_remaining_seconds`, etc.

- [ ] Open https://benchmarks.darvinyi.com/ and confirm the crawl button is visible
      and not stuck in an error state.

---

## 5. End-to-end crawl test (manual, once)

Do this once after first deploy to prove the full loop works. **It burns the 24-hour
cooldown**, so don't repeat unless you change `CRAWL_COOLDOWN_HOURS`.

- [ ] Click the crawl button in the live UI.
- [ ] Watch Railway logs — you should see agent activity, then a completion log line.
- [ ] After completion, refresh the page and confirm:
  - The button is now in cooldown state with a countdown.
  - Any newly-discovered benchmarks render in the list.
- [ ] Hit `/api/crawl/runs` and confirm the latest run is recorded with
      `status: "success"` and non-zero `candidates_found`.

---

## 6. If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| `/api/crawl/status` returns 500, logs say "no benchmarks.json … and no seed file found" | Volume mounted but the seed wasn't copied into the image | Check the Dockerfile `COPY … /app/seed/benchmarks.json` line still exists; redeploy |
| Button stuck "running" forever after a process restart | The recovery routine flips it on next boot — but boot only happens on the next request | Hit `/api/crawl/status` once; it triggers instrumentation, which recovers the interrupted run |
| 401 from the agent on trigger | `ANTHROPIC_API_KEY` not set or invalid | Re-check the Variables tab; make sure the key isn't truncated |
| New benchmarks don't render after success | Page is statically cached | Reload with cache bypass; if pages are pre-rendered at build, may need to switch the affected route to dynamic rendering |
