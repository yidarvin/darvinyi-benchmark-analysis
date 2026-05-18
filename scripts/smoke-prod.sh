#!/usr/bin/env bash
# Smoke test for the production crawl API.
#
# Usage:
#   scripts/smoke-prod.sh                              # hits https://benchmarks.darvinyi.com
#   scripts/smoke-prod.sh https://other.example.com    # override base URL
#
# What this checks:
#   - GET /api/crawl/status returns valid JSON
#   - GET /api/crawl/runs   returns valid JSON
#
# What this DOES NOT do (intentionally):
#   - POST /api/crawl/trigger — that would call the Anthropic API and burn the
#     24-hour cooldown. Trigger manually when you actually want a run.
#
# Manual end-to-end test (do this once after first deploy):
#   1. Run this script — confirm both endpoints return 200 + JSON.
#   2. In a browser, click the crawl button on https://benchmarks.darvinyi.com/.
#   3. Watch Railway logs for agent activity and a completion line.
#   4. Re-run this script — `last_status` should be "success", and
#      `cooldown_remaining_seconds` should be > 0.
#   5. Refresh the site — new benchmarks should render and the button should
#      show the cooldown countdown.
#   6. Hit /api/crawl/runs and confirm the latest run has non-zero
#      `candidates_found` and `added`.

set -euo pipefail

BASE="${1:-https://benchmarks.darvinyi.com}"

# jq is nice-to-have; fall back to raw output if not installed.
if command -v jq >/dev/null 2>&1; then
  pretty() { jq .; }
else
  pretty() { cat; }
fi

echo "=== GET ${BASE}/api/crawl/status ==="
curl -sS --fail-with-body "${BASE}/api/crawl/status" | pretty
echo

echo "=== GET ${BASE}/api/crawl/runs ==="
curl -sS --fail-with-body "${BASE}/api/crawl/runs" | pretty
echo

echo "OK — both endpoints responded."
