// Server entry for /benchmarks. Loads the merged card-item list (bundled
// curated benchmarks + crawl-discovered stubs) and hands it to a client
// component for filter/sort interactivity. `force-dynamic` so crawl-added
// stubs surface on the next request without rebuilding.

import { loadBenchmarkCardItems } from "@/data/loaders";
import { BenchmarksClient } from "./BenchmarksClient";

export const dynamic = "force-dynamic";

export default async function BenchmarksPage() {
  const items = await loadBenchmarkCardItems();
  return <BenchmarksClient items={items} />;
}
