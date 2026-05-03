import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SaturationBadge } from "./SaturationBadge";
import { categoryColor, categoryLabel, cn } from "@/lib/utils";
import type { Benchmark } from "@/lib/types";
import { MODEL_MAP } from "@/data/models";

interface BenchmarkCardProps {
  benchmark: Benchmark;
}

export function BenchmarkCard({ benchmark }: BenchmarkCardProps) {
  const topResult = benchmark.results
    .slice()
    .sort((a, b) => b.score - a.score)[0];
  const topModel = topResult ? MODEL_MAP[topResult.modelId] : null;

  const isContaminated = benchmark.saturationStatus === "contaminated";

  return (
    <Link href={`/benchmarks/${benchmark.slug}`} className="block group">
      <div
        className={cn(
          "h-full rounded-xl border bg-zinc-900 p-5 transition-colors",
          "hover:border-zinc-700 hover:bg-zinc-800/50",
          isContaminated ? "border-red-500/30" : "border-zinc-800"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge color={categoryColor(benchmark.category)}>
              {categoryLabel(benchmark.category)}
            </Badge>
            <SaturationBadge status={benchmark.saturationStatus} />
          </div>
          <span className="text-xs text-zinc-600 shrink-0">{benchmark.stats.year}</span>
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold text-zinc-50 mb-1.5 group-hover:text-white transition-colors">
          {benchmark.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-4">
          {benchmark.shortDescription}
        </p>

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-600">
            {benchmark.stats.totalTasks.toLocaleString()} tasks
          </span>
          {topResult && topModel && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: topModel.color }}
              />
              <span className="text-xs font-mono font-medium text-zinc-300">
                {topResult.scoreLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
