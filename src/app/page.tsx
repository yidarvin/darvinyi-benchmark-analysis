import Link from "next/link";
import { ALL_BENCHMARKS, ALL_AGENTS } from "@/data";
import { CATEGORIES } from "@/data/categories";
import { MODELS } from "@/data/models";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { SaturationBadge } from "@/components/benchmarks/SaturationBadge";
import { categoryColor, categoryLabel, saturationColor } from "@/lib/utils";

export default function HomePage() {
  // The Real Work Gap data
  const sweBenchPro = ALL_BENCHMARKS.find((b) => b.slug === "swe-bench");
  const gaia = ALL_BENCHMARKS.find((b) => b.slug === "gaia");
  const rli = ALL_AGENTS.find((a) => a.slug === "rli");

  const sweBenchProTop = sweBenchPro?.results
    .filter((r) => r.setup?.includes("Pro"))
    .sort((a, b) => b.score - a.score)[0];

  const gaiaTop = gaia?.results.sort((a, b) => b.score - a.score)[0];
  const rliTop = rli?.results.sort((a, b) => b.score - a.score)[0];

  // Group benchmarks by saturation for status overview
  const active = ALL_BENCHMARKS.filter((b) => b.saturationStatus === "active");
  const contaminated = ALL_BENCHMARKS.filter(
    (b) => b.saturationStatus === "contaminated"
  );
  const saturated = ALL_BENCHMARKS.filter(
    (b) => b.saturationStatus === "saturated" || b.saturationStatus === "nearing-saturation"
  );

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="pt-8 pb-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Updated 2026
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-50 leading-tight mb-5">
            The AI Benchmark
            <br />
            <span className="text-cyan-400">Explorer</span>
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl">
            Deep-dives into every major LLM benchmark — what they test, how they
            work, real task examples, and where the models actually stand.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/benchmarks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition-colors"
            >
              Explore Benchmarks
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-200 font-medium text-sm hover:bg-zinc-800 transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Benchmarks" value={ALL_BENCHMARKS.length} color="#06b6d4" />
          <StatCard label="Agent Evals" value={ALL_AGENTS.length} color="#10b981" />
          <StatCard label="Curated Models" value={MODELS.length} color="#8b5cf6" />
          <StatCard label="Agentic Benchmarks" value={ALL_AGENTS.length} sub="Real-work evaluations" color="#f59e0b" />
        </div>
      </section>

      {/* The Real Work Gap */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-50 mb-2">The Real Work Gap</h2>
          <p className="text-sm text-zinc-500 max-w-2xl">
            Models that ace structured benchmarks often fail dramatically on real
            end-to-end professional work. The gap is larger than most people
            expect.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs text-zinc-500 mb-1">SWE-bench Pro</p>
            <p className="text-3xl font-bold text-cyan-400 font-mono mb-1">
              {sweBenchProTop?.scoreLabel ?? "58.6%"}
            </p>
            <p className="text-xs text-zinc-500">Resolving real GitHub issues</p>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-600">Contamination-resistant coding benchmark</p>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs text-zinc-500 mb-1">GAIA (Top Agent)</p>
            <p className="text-3xl font-bold text-green-400 font-mono mb-1">
              {gaiaTop?.scoreLabel ?? "67.0%"}
            </p>
            <p className="text-xs text-zinc-500">Real-world multi-step tasks</p>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-600">With tool access; human baseline is 92%</p>
            </div>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-zinc-900 p-5">
            <p className="text-xs text-zinc-500 mb-1">RLI Automation Rate</p>
            <p className="text-3xl font-bold text-red-400 font-mono mb-1">
              {rliTop?.scoreLabel ?? "3.75%"}
            </p>
            <p className="text-xs text-zinc-500">Real Upwork freelance projects</p>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-600">$143,991 of actual paid work • 240 projects</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-600 mt-3 italic">
          The same models scoring 80%+ on structured benchmarks complete under 4% of real freelance projects to client-acceptable quality.
        </p>
      </section>

      {/* Category grid */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-50 mb-2">Browse by Category</h2>
          <p className="text-sm text-zinc-500">
            {ALL_BENCHMARKS.length} benchmarks across {CATEGORIES.length} categories.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const count = ALL_BENCHMARKS.filter((b) => b.category === cat.slug).length;
            if (count === 0) return null;
            return (
              <Link
                key={cat.slug}
                href={`/benchmarks?category=${cat.slug}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-lg"
                  style={{ backgroundColor: cat.color + "20" }}
                >
                  <span style={{ color: cat.color }}>◆</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-50 mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-600 line-clamp-2 mb-3">
                  {cat.description}
                </p>
                <p className="text-xs font-medium" style={{ color: cat.color }}>
                  {count} benchmark{count !== 1 ? "s" : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Benchmark status overview */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-50 mb-2">Benchmark Status</h2>
          <p className="text-sm text-zinc-500">
            Which benchmarks still differentiate frontier models?
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Active */}
          <div className="rounded-xl border border-green-500/20 bg-zinc-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-400">Active ({active.length})</span>
            </div>
            <div className="space-y-1.5">
              {active.map((b) => (
                <Link
                  key={b.slug}
                  href={`/benchmarks/${b.slug}`}
                  className="flex items-center justify-between group"
                >
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {b.name}
                  </span>
                  <Badge color={categoryColor(b.category)} size="sm">
                    {categoryLabel(b.category)}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Contaminated */}
          <div className="rounded-xl border border-red-500/20 bg-zinc-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-red-400">Contaminated ({contaminated.length})</span>
            </div>
            <div className="space-y-1.5">
              {contaminated.map((b) => (
                <Link
                  key={b.slug}
                  href={`/benchmarks/${b.slug}`}
                  className="flex items-center justify-between group"
                >
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {b.name}
                  </span>
                  <SaturationBadge status={b.saturationStatus} />
                </Link>
              ))}
            </div>
            <p className="text-xs text-zinc-600 mt-3">
              Training data leakage detected; no longer reliable for frontier model comparison.
            </p>
          </div>

          {/* Saturated */}
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span className="text-sm font-semibold text-zinc-400">Saturated / Nearing ({saturated.length})</span>
            </div>
            <div className="space-y-1.5">
              {saturated.map((b) => (
                <Link
                  key={b.slug}
                  href={`/benchmarks/${b.slug}`}
                  className="flex items-center justify-between group"
                >
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {b.name}
                  </span>
                  <SaturationBadge status={b.saturationStatus} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Agent Evals callout */}
      <section>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center shrink-0 text-cyan-400 font-bold text-lg">
              {ALL_AGENTS.length}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-50 mb-1">
                Agentic Evaluations
              </h2>
              <p className="text-sm text-zinc-400 mb-4">
                These systems evaluate AI on real, economically-grounded work — not synthetic tasks.
                They represent the most rigorous tests of whether AI can actually replace human labor.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                {ALL_AGENTS.map((agent) => (
                  <Link
                    key={agent.slug}
                    href={`/agents/${agent.slug}`}
                    className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 hover:border-cyan-500/40 hover:bg-zinc-800 transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-zinc-50">
                      {agent.name}
                    </span>
                    <span className="text-xs text-zinc-600 ml-auto">
                      {agent.institution}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                href="/agents"
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Explore all agent evaluations →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
