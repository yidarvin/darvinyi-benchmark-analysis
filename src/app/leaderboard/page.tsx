// Server entry for /leaderboard. Loads the merged benchmark list (bundled
// curated benchmarks + crawl-discovered stubs) and hands it to a client
// component for interactivity. `force-dynamic` so crawl-added stubs surface
// on the next request without rebuilding.

import { loadBenchmarkCardItems } from "@/data/loaders";
import { LeaderboardClient } from "./LeaderboardClient";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const items = await loadBenchmarkCardItems();
  return <LeaderboardClient items={items} />;
}
