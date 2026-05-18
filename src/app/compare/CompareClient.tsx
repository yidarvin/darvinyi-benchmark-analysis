"use client";

import { useState, useMemo } from "react";
import { MODELS } from "@/data/models";
import { PageHeader } from "@/components/ui/SectionHeader";
import { RadarChart, type RadarDataPoint } from "@/components/charts/RadarChart";
import { cn } from "@/lib/utils";
import type { BenchmarkCardItem, BenchmarkResult } from "@/lib/types";

interface Props {
  items: BenchmarkCardItem[];
}

// Discriminator helpers — compare rendering has to handle both kinds: curated
// entries with full results, and stubs that render as empty rows.
function itemSlug(i: BenchmarkCardItem): string {
  return i.kind === "full" ? i.benchmark.slug : i.slug;
}
function itemName(i: BenchmarkCardItem): string {
  return i.kind === "full" ? i.benchmark.name : i.name;
}
function itemResults(i: BenchmarkCardItem): BenchmarkResult[] {
  return i.kind === "full" ? i.benchmark.results : [];
}

// Category groupings for radar chart — slugs are intentionally hardcoded to
// curated benchmarks; the radar covers stable capability axes and ignores
// stubs by design.
const RADAR_CATEGORIES = [
  { key: "coding", label: "Coding", benchmarks: ["swe-bench", "humaneval", "livecodebench"] },
  { key: "math", label: "Math", benchmarks: ["math", "gsm8k", "aime"] },
  { key: "reasoning", label: "Reasoning", benchmarks: ["gpqa", "bigbench-hard", "mmlu"] },
  { key: "agent", label: "Agent", benchmarks: ["gaia", "webarena", "tau-bench"] },
  { key: "knowledge", label: "Knowledge", benchmarks: ["mmlu", "arc", "truthfulqa"] },
];

function buildModelScores(items: BenchmarkCardItem[]) {
  const scores: Record<string, Record<string, number>> = {};

  MODELS.forEach((m) => {
    scores[m.id] = {};
    items.forEach((item) => {
      const slug = itemSlug(item);
      const results = itemResults(item).filter((r) => r.modelId === m.id);
      if (results.length > 0) {
        scores[m.id][slug] = Math.max(...results.map((r) => r.score));
      }
    });
  });

  return scores;
}

export function CompareClient({ items }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["gpt-5", "claude-opus-4-6", "gemini-2-5-pro"]);

  const allScores = useMemo(() => buildModelScores(items), [items]);

  const selectedModels = useMemo(
    () => MODELS.filter((m) => selectedIds.includes(m.id)),
    [selectedIds]
  );

  // Build radar data
  const radarData = useMemo((): RadarDataPoint[] => {
    return RADAR_CATEGORIES.map((cat) => {
      const point: RadarDataPoint = { category: cat.label };
      selectedModels.forEach((m) => {
        const scores = cat.benchmarks
          .map((slug) => allScores[m.id]?.[slug])
          .filter((s): s is number => s !== undefined);
        point[m.id] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      });
      return point;
    });
  }, [selectedModels, allScores]);

  // Benchmarks worth showing in the detail table: either at least one selected
  // model has a score, OR it's a crawl-discovered stub (surface it as an empty
  // row so users see new benchmarks landing even before scores are populated).
  const relevantBenchmarks = useMemo(() => {
    return items.filter((item) => {
      if (item.kind === "crawl-stub") return true;
      const slug = itemSlug(item);
      return selectedModels.some((m) => allScores[m.id]?.[slug] !== undefined);
    });
  }, [items, selectedModels, allScores]);

  function toggleModel(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  return (
    <div>
      <PageHeader
        title="Compare Models"
        description="Select 2–4 models to compare side-by-side across all benchmarks."
      />

      {/* Model selector */}
      <div className="mb-8">
        <p className="text-xs text-zinc-500 mb-3">
          {selectedIds.length}/4 models selected — click to add or remove
        </p>
        <div className="flex flex-wrap gap-2">
          {MODELS.map((model) => {
            const selected = selectedIds.includes(model.id);
            return (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                  selected
                    ? "text-zinc-50"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                )}
                style={
                  selected
                    ? {
                        backgroundColor: model.color + "25",
                        borderColor: model.color + "60",
                        color: model.color,
                      }
                    : {}
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: selected ? model.color : "#71717a" }}
                />
                {model.shortName}
                <span className="text-zinc-600 text-[10px]">{model.org}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedModels.length >= 2 && (
        <>
          {/* Radar Chart */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 mb-8">
            <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
              Capability Profile
            </h2>
            <RadarChart data={radarData} models={selectedModels} />
            <p className="text-xs text-zinc-600 mt-3 text-center">
              Average score across benchmarks in each category. Higher = better.
            </p>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 mb-8">
            <h2 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
              Pricing (per million tokens)
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedModels.map((model) => (
                <div key={model.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: model.color }} />
                    <span className="text-xs font-medium text-zinc-300">{model.shortName}</span>
                  </div>
                  {model.pricing ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-600">Input</span>
                        <span className="font-mono text-zinc-300">${model.pricing.inputPerMillion.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-600">Output</span>
                        <span className="font-mono text-zinc-300">${model.pricing.outputPerMillion.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600">Not available</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed score table */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="text-left px-4 py-3 text-zinc-500 font-medium">Benchmark</th>
                  {selectedModels.map((m) => (
                    <th key={m.id} className="text-right px-3 py-3 font-medium" style={{ color: m.color }}>
                      {m.shortName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {relevantBenchmarks.map((b) => {
                  const slug = itemSlug(b);
                  const name = itemName(b);
                  const results = itemResults(b);
                  return (
                    <tr key={slug} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: "#3f3f46" }}
                          />
                          <a
                            href={`/benchmarks/${slug}`}
                            className="text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
                          >
                            {name}
                          </a>
                          {b.isNew && (
                            <span
                              title="Added by the most recent crawl"
                              className="text-[8px] font-semibold px-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            >
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      {selectedModels.map((m) => {
                        const score = allScores[m.id]?.[slug];
                        const result = results.find(
                          (r) => r.modelId === m.id && r.score === score
                        );
                        return (
                          <td key={m.id} className="px-3 py-2.5 text-right font-mono">
                            {result ? (
                              <span className="text-zinc-200">{result.scoreLabel}</span>
                            ) : (
                              <span className="text-zinc-700">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedModels.length < 2 && (
        <div className="text-center py-20 text-zinc-600">
          Select at least 2 models to compare.
        </div>
      )}
    </div>
  );
}
