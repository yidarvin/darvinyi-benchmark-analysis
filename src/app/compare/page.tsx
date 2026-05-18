// Server entry for /compare. Loads the merged benchmark list (bundled
// curated benchmarks + crawl-discovered stubs) and hands it to a client
// component for interactivity. `force-dynamic` so crawl-added stubs surface
// on the next request without rebuilding.

import { loadBenchmarkCardItems } from "@/data/loaders";
import { CompareClient } from "./CompareClient";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const items = await loadBenchmarkCardItems();
  return <CompareClient items={items} />;
}
