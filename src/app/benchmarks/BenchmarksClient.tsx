"use client";

import { useState, useMemo } from "react";
import { CATEGORIES } from "@/data/categories";
import { BenchmarkCard } from "@/components/benchmarks/BenchmarkCard";
import { CrawlUpdateButton } from "@/components/CrawlUpdateButton";
import { cn } from "@/lib/utils";
import type { BenchmarkCardItem, BenchmarkCategory } from "@/lib/types";

type SortKey = "name" | "year" | "score";

interface Props {
  items: BenchmarkCardItem[];
}

// Discriminator helpers — the filter/sort logic has to handle both kinds.
// Curated items have rich typed fields; stubs have sparse strings/nulls.
function itemName(i: BenchmarkCardItem): string {
  return i.kind === "full" ? i.benchmark.name : i.name;
}

function itemCategory(i: BenchmarkCardItem): string {
  return i.kind === "full" ? i.benchmark.category : i.category;
}

function itemYear(i: BenchmarkCardItem): number {
  if (i.kind === "full") return i.benchmark.stats.year;
  return i.year ?? 0;
}

function itemTopScore(i: BenchmarkCardItem): number {
  if (i.kind !== "full") return -1;
  const results = i.benchmark.results;
  if (!results.length) return 0;
  return Math.max(...results.map((r) => r.score));
}

export function BenchmarksClient({ items }: Props) {
  const [category, setCategory] = useState<BenchmarkCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    let out = [...items];

    if (category !== "all") {
      out = out.filter((i) => itemCategory(i) === category);
    }

    out.sort((a, b) => {
      if (sort === "name") return itemName(a).localeCompare(itemName(b));
      if (sort === "year") return itemYear(b) - itemYear(a);
      if (sort === "score") return itemTopScore(b) - itemTopScore(a);
      return 0;
    });

    return out;
  }, [items, category, sort]);

  // Only show category chips for categories that actually have entries.
  const cats = CATEGORIES.filter((c) =>
    items.some((i) => itemCategory(i) === c.slug),
  );

  return (
    <div>
      <div className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 mb-2">Benchmarks</h1>
          <p className="text-base text-zinc-400 max-w-2xl">
            Every major LLM benchmark explained — what it tests, how tasks
            work, and where models stand.
          </p>
        </div>
        <CrawlUpdateButton />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              category === "all"
                ? "bg-zinc-700 text-zinc-50"
                : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300",
            )}
          >
            All ({items.length})
          </button>
          {cats.map((c) => {
            const count = items.filter((i) => itemCategory(i) === c.slug).length;
            return (
              <button
                key={c.slug}
                onClick={() => setCategory(c.slug as BenchmarkCategory)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  category === c.slug
                    ? "text-zinc-50"
                    : "bg-zinc-900 text-zinc-500 hover:text-zinc-300",
                )}
                style={
                  category === c.slug
                    ? {
                        backgroundColor: c.color + "30",
                        borderColor: c.color + "60",
                        color: c.color,
                      }
                    : { borderColor: "#3f3f46" }
                }
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>

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
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <BenchmarkCard
            key={item.kind === "full" ? item.benchmark.slug : item.slug}
            item={item}
          />
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
