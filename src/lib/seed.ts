import { ensureSeeded, recoverInterruptedRuns } from "@/lib/storage";

let seedPromise: Promise<void> | null = null;

// Idempotent boot hook: first caller seeds the data dir AND recovers any
// runs left in "running" by a previous crash. Concurrent callers await the
// same promise. Errors are not memoized so a transient failure can be
// retried on the next request that needs the volume.
//
// Recovery is intentionally gated behind this memoized boot hook so that
// API routes which call ensureSeeded() directly never re-run recovery —
// doing so during a live crawl would mark the in-flight run as failed.
export function seed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureSeeded();
      await recoverInterruptedRuns();
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}
