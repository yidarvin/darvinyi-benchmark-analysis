"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MODELS } from "@/data/models";
import { CATEGORIES } from "@/data/categories";
import { PageHeader } from "@/components/ui/SectionHeader";
import { cn, categoryColor } from "@/lib/utils";
import type {
  BenchmarkCardItem,
  BenchmarkCategory,
  BenchmarkResult,
} from "@/lib/types";

interface Props {
  items: BenchmarkCardItem[];
}

// Discriminator helpers — leaderboard rendering has to handle both kinds:
// curated entries carry full results; stubs render as empty columns.
function itemSlug(i: BenchmarkCardItem): string {
  return i.kind === "full" ? i.benchmark.slug : i.slug;
}
function itemName(i: BenchmarkCardItem): string {
  return i.kind === "full" ? i.benchmark.name : i.name;
}
function itemCategory(i: BenchmarkCardItem): string {
  return i.kind === "full" ? i.benchmark.category : i.category;
}
function itemResults(i: BenchmarkCardItem): BenchmarkResult[] {
  return i.kind === "full" ? i.benchmark.results : [];
}

const KNOWN_CATEGORIES: BenchmarkCategory[] = [
  "coding",
  "math",
  "reasoning",
  "knowledge",
  "agent",
  "human-preference",
  "real-work",
  "contamination-resistant",
];

function headerColor(category: string): string {
  if (KNOWN_CATEGORIES.includes(category as BenchmarkCategory)) {
    return categoryColor(category as BenchmarkCategory);
  }
  return "#71717a";
}

function buildMatrix(items: BenchmarkCardItem[]) {
  const matrix: Record<
    string,
    Record<
      string,
      { scoreLabel: string; score: number; isVendorReported: boolean }
    >
  > = {};

  MODELS.forEach((m) => {
    matrix[m.id] = {};
  });

  items.forEach((item) => {
    const slug = itemSlug(item);
    itemResults(item).forEach((r) => {
      if (!matrix[r.modelId]) return;
      const existing = matrix[r.modelId][slug];
      if (!existing || r.score > existing.score) {
        matrix[r.modelId][slug] = {
          scoreLabel: r.scoreLabel ?? `${r.score}`,
          score: r.score,
          isVendorReported: r.isVendorReported,
        };
      }
    });
  });

  return matrix;
}

export function LeaderboardClient({ items }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<BenchmarkCategory | "all">("all");

  const matrix = useMemo(() => buildMatrix(items), [items]);

  const visibleBenchmarks = useMemo(() => {
    if (categoryFilter === "all") return items;
    return items.filter((i) => itemCategory(i) === categoryFilter);
  }, [items, categoryFilter]);

  // Score each model for sorting (count of benchmarks with data across visible benchmarks)
  const sortedModels = useMemo(() => {
    return [...MODELS].sort((a, b) => {
      const aCount = visibleBenchmarks.filter(
        (bm) => matrix[a.id]?.[itemSlug(bm)],
      ).length;
      const bCount = visibleBenchmarks.filter(
        (bm) => matrix[b.id]?.[itemSlug(bm)],
      ).length;
      return bCount - aCount;
    });
  }, [visibleBenchmarks, matrix]);

  // Compute per-benchmark max for heatmap
  const benchmarkMaxes = useMemo(() => {
    const maxes: Record<string, number> = {};
    visibleBenchmarks.forEach((b) => {
      const slug = itemSlug(b);
      const scores = MODELS.map((m) => matrix[m.id]?.[slug]?.score ?? 0);
      maxes[slug] = Math.max(...scores);
    });
    return maxes;
  }, [visibleBenchmarks, matrix]);

  function heatmapBg(score: number, max: number): string {
    if (!score || !max) return "transparent";
    const pct = score / max;
    if (pct > 0.9) return "rgba(16,185,129,0.15)";
    if (pct > 0.75) return "rgba(16,185,129,0.08)";
    if (pct > 0.5) return "rgba(245,158,11,0.08)";
    return "rgba(239,68,68,0.06)";
  }

  const cats = CATEGORIES.filter((c) =>
    items.some((i) => itemCategory(i) === c.slug),
  );

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="All models × all benchmarks. Green cells = near max score for that benchmark."
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            categoryFilter === "all"
              ? "bg-zinc-700 text-zinc-50"
              : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
          )}
        >
          All
        </button>
        {cats.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCategoryFilter(c.slug as BenchmarkCategory)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              categoryFilter === c.slug ? "text-zinc-50" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            )}
            style={
              categoryFilter === c.slug
                ? { backgroundColor: c.color + "30", borderColor: c.color + "60", color: c.color }
                : { borderColor: "#3f3f46" }
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-zinc-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(16,185,129,0.2)" }} />
          Top score
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(245,158,11,0.12)" }} />
          Mid range
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(239,68,68,0.1)" }} />
          Lower score
        </div>
        <span className="text-zinc-700">— = no data</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-x-auto">
        <table className="text-xs border-collapse" style={{ minWidth: `${200 + visibleBenchmarks.length * 90}px` }}>
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/90">
              <th className="sticky left-0 z-10 bg-zinc-900 px-4 py-3 text-left font-medium text-zinc-500 min-w-[180px] border-r border-zinc-800">
                Model
              </th>
              {visibleBenchmarks.map((b) => {
                const slug = itemSlug(b);
                const name = itemName(b);
                return (
                  <th
                    key={slug}
                    className="px-2 py-3 text-center font-medium whitespace-nowrap"
                    style={{ color: headerColor(itemCategory(b)) }}
                  >
                    <Link
                      href={`/benchmarks/${slug}`}
                      className="hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
                      title={name}
                    >
                      <span className="block max-w-[80px] truncate">{name.split(" ")[0]}</span>
                      {b.isNew && (
                        <span
                          title="Added by the most recent crawl"
                          className="text-[8px] font-semibold px-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        >
                          NEW
                        </span>
                      )}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedModels.map((model) => (
              <tr
                key={model.id}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors"
              >
                {/* Model name — sticky */}
                <td className="sticky left-0 z-10 bg-zinc-950 px-4 py-2.5 border-r border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: model.color }}
                    />
                    <div>
                      <span className="font-medium text-zinc-200">{model.shortName}</span>
                      <span className="text-zinc-600 ml-1.5">{model.org}</span>
                    </div>
                    {model.isOpen && (
                      <span className="ml-auto text-[9px] px-1 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
                        OSS
                      </span>
                    )}
                  </div>
                </td>

                {/* Scores */}
                {visibleBenchmarks.map((b) => {
                  const slug = itemSlug(b);
                  const entry = matrix[model.id]?.[slug];
                  return (
                    <td
                      key={slug}
                      className="px-2 py-2.5 text-center"
                      style={{
                        backgroundColor: entry
                          ? heatmapBg(entry.score, benchmarkMaxes[slug])
                          : "transparent",
                      }}
                    >
                      {entry ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="font-mono font-medium text-zinc-200">
                            {entry.scoreLabel}
                          </span>
                          {entry.isVendorReported && (
                            <span className="text-[8px] text-amber-500" title="Vendor reported">v</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-600 mt-3">
        Scores reflect best available result per model per benchmark. <span className="text-amber-600">v</span> = vendor self-reported.
        Benchmark names truncated — click to view full details.
      </p>
    </div>
  );
}
