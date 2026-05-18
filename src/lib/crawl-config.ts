// Shared crawl-feature configuration. Currently only the cooldown window —
// extracted because both /api/crawl/trigger (enforces) and /api/crawl/status
// (reports remaining) need to agree on the value.

const DEFAULT_COOLDOWN_HOURS = 24;

export function cooldownMs(): number {
  const raw = process.env.CRAWL_COOLDOWN_HOURS;
  const hours = raw != null && raw !== "" ? Number(raw) : DEFAULT_COOLDOWN_HOURS;
  if (!Number.isFinite(hours) || hours < 0) return DEFAULT_COOLDOWN_HOURS * 60 * 60 * 1000;
  return hours * 60 * 60 * 1000;
}

// Seconds remaining until cooldown clears for a given completion timestamp.
// Returns 0 when no cooldown is active.
export function cooldownRemainingSeconds(lastCompletedAt: string | null, now: number = Date.now()): number {
  if (!lastCompletedAt) return 0;
  const completed = Date.parse(lastCompletedAt);
  if (Number.isNaN(completed)) return 0;
  const elapsed = now - completed;
  const remaining = cooldownMs() - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
