"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BenchmarkResult } from "@/lib/types";
import { MODEL_MAP } from "@/data/models";

interface ScoreLineChartProps {
  results: BenchmarkResult[];
  metric?: string;
}

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

export function ScoreLineChart({ results, metric = "Score" }: ScoreLineChartProps) {
  // Build models that have entries with valid dates
  const modelIds = [...new Set(results.map((r) => r.modelId))].filter(
    (id) => MODEL_MAP[id]
  );

  // Build date-keyed data
  const dateMap: Record<string, DataPoint> = {};
  results.forEach((r) => {
    if (!MODEL_MAP[r.modelId]) return;
    if (!dateMap[r.date]) dateMap[r.date] = { date: r.date };
    dateMap[r.date][r.modelId] = r.score;
  });

  const data = Object.values(dateMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  if (data.length < 2 || modelIds.length === 0) return null;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#3f3f46" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#3f3f46" }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              color: "#fafafa",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, metric]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
          />
          {modelIds.map((id) => {
            const model = MODEL_MAP[id];
            return (
              <Line
                key={id}
                type="monotone"
                dataKey={id}
                name={model?.shortName || id}
                stroke={model?.color || "#71717a"}
                strokeWidth={2}
                dot={{ fill: model?.color || "#71717a", r: 3 }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
