"use client";

import { ScoreLineChart } from "./ScoreLineChart";
import type { BenchmarkResult } from "@/lib/types";

export function ScoreLineChartWrapper({
  results,
  metric,
}: {
  results: BenchmarkResult[];
  metric?: string;
}) {
  return <ScoreLineChart results={results} metric={metric} />;
}
