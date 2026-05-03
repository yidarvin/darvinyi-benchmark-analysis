"use client";

import { useState } from "react";
import { VendorBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { BenchmarkResult } from "@/lib/types";
import { MODEL_MAP } from "@/data/models";

interface BenchmarkTableProps {
  results: BenchmarkResult[];
}

export function BenchmarkTable({ results }: BenchmarkTableProps) {
  const [sortBy, setSortBy] = useState<"score" | "date">("score");

  const sorted = [...results].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    return b.date.localeCompare(a.date);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-500">{results.length} results</p>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-zinc-500">Sort:</span>
          {(["score", "date"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "px-2 py-0.5 rounded capitalize transition-colors",
                sortBy === s
                  ? "bg-zinc-700 text-zinc-200"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 w-10">#</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Model</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Score</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 hidden sm:table-cell">Setup</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((result, i) => {
              const model = MODEL_MAP[result.modelId];
              return (
                <tr
                  key={`${result.modelId}-${i}`}
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-zinc-600 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {model && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: model.color }}
                        />
                      )}
                      <span className="text-sm font-medium text-zinc-200">
                        {model?.shortName || result.modelId}
                      </span>
                      {model && (
                        <span className="text-xs text-zinc-600 hidden sm:inline">
                          {model.org}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {result.isVendorReported && <VendorBadge />}
                      <span className="font-mono font-semibold text-zinc-100 text-sm">
                        {result.scoreLabel}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 hidden sm:table-cell">
                    {result.setup || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600 font-mono hidden md:table-cell">
                    {result.date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-600 mt-2">
        <span className="inline-flex items-center gap-1">
          <VendorBadge /> = Self-reported by the model&apos;s creator, not independently verified
        </span>
      </p>
    </div>
  );
}
