"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { Model } from "@/lib/types";

export interface RadarDataPoint {
  category: string;
  [modelId: string]: string | number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  models: Model[];
}

export function RadarChart({ data, models }: RadarChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "#71717a", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              color: "#fafafa",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }} />
          {models.map((model) => (
            <Radar
              key={model.id}
              name={model.shortName}
              dataKey={model.id}
              stroke={model.color}
              fill={model.color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
