import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ALL_BENCHMARKS, BENCHMARK_MAP } from "@/data";
import { Badge } from "@/components/ui/Badge";
import { SaturationBadge } from "@/components/benchmarks/SaturationBadge";
import { BenchmarkTable } from "@/components/benchmarks/BenchmarkTable";
import { ExampleBlock } from "@/components/benchmarks/ExampleBlock";
import { ScoreLineChartWrapper } from "@/components/charts/ScoreLineChartWrapper";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { categoryColor, categoryLabel, saturationColor } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_BENCHMARKS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const benchmark = BENCHMARK_MAP[slug];
  if (!benchmark) return {};
  return {
    title: benchmark.name,
    description: benchmark.shortDescription,
  };
}

export default async function BenchmarkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const benchmark = BENCHMARK_MAP[slug];
  if (!benchmark) notFound();

  const isContaminated = benchmark.saturationStatus === "contaminated";

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/benchmarks"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
      >
        ← Back to Benchmarks
      </Link>

      {/* Header */}
      <div
        className={
          isContaminated
            ? "rounded-xl border border-red-500/30 bg-red-500/5 p-6 mb-8"
            : "mb-8"
        }
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge color={categoryColor(benchmark.category)}>
            {categoryLabel(benchmark.category)}
          </Badge>
          <SaturationBadge status={benchmark.saturationStatus} />
          {isContaminated && (
            <span className="text-xs text-red-400 font-medium">
              ⚠ Deprecated — training data leakage confirmed
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">{benchmark.name}</h1>
        <p className="text-base text-zinc-400">{benchmark.shortDescription}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-zinc-800">
          <div>
            <span className="text-xs text-zinc-600 block">Tasks</span>
            <span className="text-sm font-mono font-semibold text-zinc-200">
              {benchmark.stats.totalTasks.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-600 block">Year</span>
            <span className="text-sm font-mono font-semibold text-zinc-200">
              {benchmark.stats.year}
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-600 block">Creator</span>
            <span className="text-sm font-semibold text-zinc-200">
              {benchmark.stats.creator}
            </span>
          </div>
          <div>
            <span className="text-xs text-zinc-600 block">Metric</span>
            <span className="text-sm font-mono font-semibold text-zinc-200">
              {benchmark.taskAnatomy.metric}
            </span>
          </div>
          {benchmark.stats.humanBaseline && (
            <div>
              <span className="text-xs text-zinc-600 block">Human Baseline</span>
              <span className="text-sm font-mono font-semibold text-amber-400">
                {benchmark.stats.humanBaseline}%
              </span>
            </div>
          )}
          {benchmark.stats.randomBaseline !== undefined && benchmark.stats.randomBaseline !== null && (
            <div>
              <span className="text-xs text-zinc-600 block">Random Chance</span>
              <span className="text-sm font-mono font-semibold text-zinc-500">
                {benchmark.stats.randomBaseline}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <section className="mb-10">
        <SectionHeader title="What It Tests" />
        <div className="space-y-3">
          {benchmark.description.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-zinc-400 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Task Anatomy */}
      <section className="mb-10">
        <SectionHeader title="Task Anatomy" description="How a single task is structured." />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          {[
            { label: "Input", value: benchmark.taskAnatomy.input },
            { label: "Output", value: benchmark.taskAnatomy.output },
            { label: "Evaluation", value: benchmark.taskAnatomy.evaluation },
            { label: "Metric", value: benchmark.taskAnatomy.metric },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex gap-4 px-5 py-4 border-b border-zinc-800 last:border-0"
            >
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider w-20 shrink-0 mt-0.5">
                {label}
              </span>
              <span className="text-sm text-zinc-300 leading-relaxed">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      {benchmark.examples.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Example Tasks"
            description={`${benchmark.examples.length} real examples from the benchmark.`}
          />
          <div className="space-y-4">
            {benchmark.examples.map((example, i) => (
              <ExampleBlock key={i} example={example} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {benchmark.results.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Leaderboard Results"
            description="Model scores sorted by performance."
          />
          <BenchmarkTable results={benchmark.results} />
        </section>
      )}

      {/* Chart */}
      {benchmark.results.length >= 3 && (
        <section className="mb-10">
          <SectionHeader
            title="Score Over Time"
            description="Performance progression across model generations."
          />
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <ScoreLineChartWrapper
              results={benchmark.results}
              metric={benchmark.taskAnatomy.metric}
            />
          </div>
        </section>
      )}

      {/* Key Findings */}
      {benchmark.keyFindings && benchmark.keyFindings.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="Key Findings" />
          <ul className="space-y-3">
            {benchmark.keyFindings.map((finding, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: saturationColor(benchmark.saturationStatus) }}
                />
                <p className="text-sm text-zinc-400 leading-relaxed">{finding}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Variants */}
      {benchmark.variants && benchmark.variants.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="Variants & Related" />
          <div className="grid sm:grid-cols-2 gap-3">
            {benchmark.variants.map((v) => (
              <div
                key={v.slug}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-zinc-200">{v.name}</h4>
                  <div className="flex items-center gap-1.5">
                    {v.taskCount && (
                      <span className="text-xs text-zinc-600 font-mono">
                        {v.taskCount.toLocaleString()} tasks
                      </span>
                    )}
                    {v.saturationStatus && (
                      <SaturationBadge status={v.saturationStatus} />
                    )}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Controversies */}
      {benchmark.controversies && benchmark.controversies.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Controversies & Caveats"
            description="Known limitations and criticisms."
          />
          <div className="space-y-2">
            {benchmark.controversies.map((c, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
              >
                <span className="text-amber-500 mt-0.5 shrink-0 text-sm">⚠</span>
                <p className="text-sm text-zinc-400 leading-relaxed">{c}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Links */}
      <section className="mb-10">
        <SectionHeader title="Links" />
        <div className="flex flex-wrap gap-2">
          {benchmark.links.arxiv && (
            <a
              href={benchmark.links.arxiv}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            >
              arXiv Paper ↗
            </a>
          )}
          {benchmark.links.leaderboard && (
            <a
              href={benchmark.links.leaderboard}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            >
              Official Leaderboard ↗
            </a>
          )}
          {benchmark.links.dataset && (
            <a
              href={benchmark.links.dataset}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            >
              Dataset ↗
            </a>
          )}
          {benchmark.links.github && (
            <a
              href={benchmark.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            >
              GitHub ↗
            </a>
          )}
          {benchmark.links.website && (
            <a
              href={benchmark.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            >
              Website ↗
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
