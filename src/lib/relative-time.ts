// Tiny dependency-free relative-time + countdown formatters.
// Used by the crawl button to render "Last updated 3d ago" and
// "Available in 7h 23m" without pulling in date-fns.

export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "just now";

  const sec = Math.round(diffMs / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;

  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;

  const wk = Math.round(day / 7);
  if (wk < 5) return `${wk}w ago`;

  // Beyond ~5 weeks, fall back to a short ISO date.
  return date.toISOString().slice(0, 10);
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;

  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin}m`;

  const hr = Math.floor(totalMin / 60);
  const remMin = totalMin % 60;
  return remMin > 0 ? `${hr}h ${remMin}m` : `${hr}h`;
}
