// ─── Enums / Union Types ──────────────────────────────────────────────────────

export type BenchmarkCategory =
  | "coding"
  | "math"
  | "reasoning"
  | "knowledge"
  | "agent"
  | "human-preference"
  | "real-work"
  | "contamination-resistant";

export type SaturationStatus =
  | "active"           // Clearly discriminating frontier models
  | "nearing-saturation" // Top models clustering, still some signal
  | "saturated"        // Effectively solved; no frontier discrimination
  | "contaminated";    // Formally deprecated due to training data leakage

export type ModelOrg =
  | "OpenAI"
  | "Anthropic"
  | "Google"
  | "xAI"
  | "Meta"
  | "DeepSeek"
  | "Mistral"
  | "Alibaba"
  | "Moonshot"
  | "MiniMax"
  | "Other";

export type EvaluationMethod =
  | "exact-match"
  | "functional-correctness"
  | "human-preference"
  | "llm-judge"
  | "human-expert"
  | "pairwise-comparison"
  | "elo";

// ─── Benchmark Types ──────────────────────────────────────────────────────────

export interface BenchmarkExample {
  title: string;
  difficulty?: string;          // e.g. "Level 3", "Hard", "Easy"
  input: string;                // The prompt/problem shown to the model
  solution?: string;            // Chain-of-thought or reasoning steps
  answer: string;               // The correct final answer
  notes?: string;               // Context about why this example is interesting
}

export interface BenchmarkResult {
  modelId: string;              // Matches Model.id
  score: number;                // 0–100 (percentage) or raw metric value
  scoreLabel?: string;          // e.g. "87.6%" or "1,496 Elo" or "14.5 hours"
  scoreType: string;            // e.g. "% Resolved", "pass@1", "Elo", "Win+Tie Rate"
  date: string;                 // ISO date string YYYY-MM
  isVendorReported: boolean;    // true = lab's own claim; false = independent eval
  setup?: string;               // e.g. "with tools", "thinking mode", "5-shot"
  notes?: string;
}

export interface BenchmarkVariant {
  name: string;
  slug: string;
  description: string;
  taskCount?: number;
  year?: number;
  saturationStatus?: SaturationStatus;
}

export interface BenchmarkStats {
  totalTasks: number;
  publicTasks?: number;
  year: number;                 // Year benchmark was introduced
  creator: string;
  institution: string;
  languages?: string[];         // Programming or natural languages
  domains?: string[];
  humanBaseline?: number;       // Human accuracy/score for comparison
  randomBaseline?: number;      // Random-guessing baseline
}

export interface Benchmark {
  slug: string;
  name: string;
  shortDescription: string;    // 1-sentence elevator pitch
  description: string;         // 2-4 paragraph full description
  category: BenchmarkCategory;
  subcategory?: string;
  tags: string[];
  saturationStatus: SaturationStatus;
  evaluationMethod: EvaluationMethod;
  stats: BenchmarkStats;
  taskAnatomy: {
    input: string;
    output: string;
    evaluation: string;
    metric: string;             // e.g. "% Resolved", "pass@1", "Accuracy"
  };
  examples: BenchmarkExample[];
  results: BenchmarkResult[];
  variants?: BenchmarkVariant[];
  controversies?: string[];
  keyFindings?: string[];       // 3-5 bullet points of notable insights
  links: {
    paper?: string;
    arxiv?: string;
    dataset?: string;
    leaderboard?: string;
    github?: string;
    website?: string;
  };
}

// ─── Agent System Types ───────────────────────────────────────────────────────

export interface AgentExample {
  title: string;
  jobType?: string;             // e.g. "Investment Banking", "Architectural Design"
  economicValue?: string;       // e.g. "$800", "$32,000"
  humanTime?: string;           // e.g. "22 hours"
  description: string;          // What the task requires
  input: string;                // What the agent receives
  output: string;               // What the agent must produce
  evaluation: string;           // How success is judged
}

export interface AgentResult {
  modelId: string;
  score: number;
  scoreLabel: string;           // e.g. "38.4%" or "2.5%" or "1771 Elo"
  scoreType: string;            // e.g. "Pass@1", "Automation Rate", "Elo"
  date: string;
  isVendorReported: boolean;
  domain?: string;              // If score is domain-specific
  notes?: string;
}

export interface AgentSystem {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  creator: string;
  institution: string;
  year: number;
  tags: string[];
  isRequired: boolean;          // true = one of the 4 required systems
  stats: {
    totalTasks: number;
    publicTasks?: number;
    domains: string[];
    avgHumanTime?: string;
    totalEconomicValue?: string;
    evaluationMethod: string;
    primaryMetric: string;
  };
  taskAnatomy: {
    setup: string;
    input: string;
    output: string;
    evaluation: string;
    metric: string;
  };
  examples: AgentExample[];
  results: AgentResult[];
  keyFindings?: string[];
  whatMakesItUnique?: string[];
  controversies?: string[];
  links: {
    paper?: string;
    arxiv?: string;
    dataset?: string;
    leaderboard?: string;
    github?: string;
    website?: string;
  };
}

// ─── Model Types ──────────────────────────────────────────────────────────────

export interface Model {
  id: string;                   // e.g. "gpt-5", "claude-opus-4-6"
  name: string;                 // Display name
  shortName: string;            // e.g. "GPT-5", "Opus 4.6"
  org: ModelOrg;
  releaseDate: string;          // YYYY-MM
  modelType: "reasoning" | "standard" | "multimodal" | "coding-specialized";
  architecture?: "MoE" | "dense";
  isOpen: boolean;              // Open weights
  contextWindow?: number;       // tokens
  pricing?: {
    inputPerMillion: number;    // USD
    outputPerMillion: number;
  };
  color: string;                // Tailwind color class for charts e.g. "#3b82f6"
  description?: string;
  strengths?: string[];
}

// ─── Results Table ────────────────────────────────────────────────────────────

export interface ResultEntry {
  modelId: string;
  benchmarkSlug: string;
  score: number;
  scoreLabel: string;
  scoreType: string;
  date: string;
  isVendorReported: boolean;
  setup?: string;
  notes?: string;
}

// ─── Category Meta ────────────────────────────────────────────────────────────

export interface CategoryMeta {
  slug: BenchmarkCategory;
  name: string;
  description: string;
  color: string;                // CSS color for badges
  icon: string;                 // Lucide icon name
  benchmarkCount?: number;
}
