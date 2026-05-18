import { ensureSeeded } from "@/lib/storage";

let seedPromise: Promise<void> | null = null;

// Idempotent boot hook: first caller kicks off ensureSeeded(); concurrent
// callers await the same promise. Errors are not memoized so a transient
// failure can be retried on the next request that needs the volume.
export function seed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = ensureSeeded().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}
