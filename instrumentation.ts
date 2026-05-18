// Next.js App Router instrumentation hook. Runs once per server boot on the
// Node.js runtime. We use it to seed the Railway Volume (or local ./.data)
// with benchmarks.json and crawl_state.json so the first request never
// races the bootstrap.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { seed } = await import("@/lib/seed");
  await seed();
}
