import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SaturationStatus, BenchmarkCategory } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function saturationColor(status: SaturationStatus): string {
  switch (status) {
    case "active":
      return "#10b981";
    case "nearing-saturation":
      return "#f59e0b";
    case "saturated":
      return "#71717a";
    case "contaminated":
      return "#ef4444";
  }
}

export function saturationLabel(status: SaturationStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "nearing-saturation":
      return "Nearing Saturation";
    case "saturated":
      return "Saturated";
    case "contaminated":
      return "Contaminated";
  }
}

export function categoryColor(category: BenchmarkCategory): string {
  switch (category) {
    case "coding":
      return "#3b82f6";
    case "math":
      return "#8b5cf6";
    case "reasoning":
    case "knowledge":
      return "#f59e0b";
    case "agent":
      return "#10b981";
    case "human-preference":
      return "#ec4899";
    case "real-work":
      return "#ef4444";
    case "contamination-resistant":
      return "#06b6d4";
  }
}

export function categoryLabel(category: BenchmarkCategory): string {
  switch (category) {
    case "coding":
      return "Coding";
    case "math":
      return "Math";
    case "reasoning":
      return "Reasoning";
    case "knowledge":
      return "Knowledge";
    case "agent":
      return "Agent Tasks";
    case "human-preference":
      return "Human Preference";
    case "real-work":
      return "Real Work";
    case "contamination-resistant":
      return "Contamination-Resistant";
  }
}

export function formatScore(score: number, scoreType: string): string {
  if (scoreType.toLowerCase().includes("elo")) return score.toFixed(0);
  if (scoreType.toLowerCase().includes("hour") || scoreType.toLowerCase().includes("minute")) return score.toString();
  return score.toFixed(1) + "%";
}

export function orgColor(org: string): string {
  switch (org) {
    case "OpenAI": return "#10a37f";
    case "Anthropic": return "#d97706";
    case "Google": return "#4285f4";
    case "xAI": return "#1d9bf0";
    case "Meta": return "#0668e1";
    case "DeepSeek": return "#1a73e8";
    case "Mistral": return "#ff7000";
    case "Alibaba": return "#6366f1";
    case "Moonshot": return "#8b5cf6";
    case "MiniMax": return "#ec4899";
    default: return "#71717a";
  }
}
