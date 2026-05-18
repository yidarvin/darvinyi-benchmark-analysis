import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { NewBadge } from "@/components/ui/NewBadge";
import { SaturationBadge } from "./SaturationBadge";
import { categoryColor, categoryLabel, cn } from "@/lib/utils";
import type { BenchmarkCardItem } from "@/lib/types";
import { MODEL_MAP } from "@/data/models";

interface BenchmarkCardProps {
  item: BenchmarkCardItem;
}

export function BenchmarkCard({ item }: BenchmarkCardProps) {
  if (item.kind === "crawl-stub") {
    return <CrawlStubCard item={item} />;
  }
  return <FullCard item={item} />;
}

function FullCard({
  item,
}: {
  item: Extract<BenchmarkCardItem, { kind: "full" }>;
}) {
  const benchmark = item.benchmark;
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
          isContaminated ? "border-red-500/30" : "border-zinc-800",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge color={categoryColor(benchmark.category)}>
              {categoryLabel(benchmark.category)}
            </Badge>
            <SaturationBadge status={benchmark.saturationStatus} />
            {item.isNew && <NewBadge />}
          </div>
          <span className="text-xs text-zinc-600 shrink-0">
            {benchmark.stats.year}
          </span>
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

// Sparse-data variant rendered when the crawl agent proposed a benchmark we
// haven't curated yet. We avoid faking missing fields — instead the card uses
// a dimmer treatment and a "pending curation" footer so the gap is obvious.
function CrawlStubCard({
  item,
}: {
  item: Extract<BenchmarkCardItem, { kind: "crawl-stub" }>;
}) {
  return (
    <Link href={`/benchmarks/${item.slug}`} className="block group">
      <div
        className={cn(
          "h-full rounded-xl border bg-zinc-900/60 p-5 transition-colors",
          "border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50",
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {item.category && (
              <Badge color="#71717a" size="sm">
                {item.category}
              </Badge>
            )}
            {item.isNew && <NewBadge />}
          </div>
          {item.year !== null && (
            <span className="text-xs text-zinc-600 shrink-0">{item.year}</span>
          )}
        </div>

        <h3 className="text-base font-semibold text-zinc-300 mb-1.5 group-hover:text-zinc-100 transition-colors">
          {item.name}
        </h3>

        {item.shortDescription && (
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-4">
            {item.shortDescription}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-600 italic">Pending curation</span>
        </div>
      </div>
    </Link>
  );
}
