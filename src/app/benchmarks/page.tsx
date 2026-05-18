"use client";

import { useState, useMemo } from "react";
import { ALL_BENCHMARKS } from "@/data";
import { CATEGORIES } from "@/data/categories";
import { BenchmarkCard } from "@/components/benchmarks/BenchmarkCard";
import { CrawlUpdateButton } from "@/components/CrawlUpdateButton";
import { cn, categoryColor } from "@/lib/utils";
import type { BenchmarkCategory } from "@/lib/types";

type SortKey = "name" | "year" | "score";

export default function BenchmarksPage() {
  const [category, setCategory] = useState<BenchmarkCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    let items = [...ALL_BENCHMARKS];

    if (category !== "all") {
      items = items.filter((b) => b.category === category);
    }

    items.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "year") return b.stats.year - a.stats.year;
      if (sort === "score") {
        const aTop = a.results.length ? Math.max(...a.results.map((r) => r.score)) : 0;
        const bTop = b.results.length ? Math.max(...b.results.map((r) => r.score)) : 0;
        return bTop - aTop;
      }
      return 0;
    });

    return items;
  }, [category, sort]);

  const cats = CATEGORIES.filter((c) =>
    ALL_BENCHMARKS.some((b) => b.category === c.slug)
  );

  return (
    <div>
      <div className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 mb-2">Benchmarks</h1>
          <p className="text-base text-zinc-400 max-w-2xl">
            Every major LLM benchmark explained — what it tests, how tasks work, and where models stand.
          </p>
        </div>
        <CrawlUpdateButton />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              category === "all"
                ? "bg-zinc-700 text-zinc-50"
                : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            All ({ALL_BENCHMARKS.length})
          </button>
          {cats.map((c) => {
            const count = ALL_BENCHMARKS.filter((b) => b.category === c.slug).length;
            return (
              <button
                key={c.slug}
                onClick={() => setCategory(c.slug as BenchmarkCategory)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  category === c.slug
                    ? "text-zinc-50"
                    : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                )}
                style={
                  category === c.slug
                    ? { backgroundColor: c.color + "30", borderColor: c.color + "60", color: c.color }
                    : { borderColor: "#3f3f46" }
                }
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-zinc-600">Sort:</span>
          {(["name", "year", "score"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors",
                sort === s
                  ? "bg-zinc-700 text-zinc-200"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((benchmark) => (
          <BenchmarkCard key={benchmark.slug} benchmark={benchmark} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-600">
          No benchmarks found for this filter.
        </div>
      )}
    </div>
  );
}
