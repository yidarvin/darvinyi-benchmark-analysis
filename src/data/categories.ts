import type { CategoryMeta } from "@/lib/types";

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "coding",
    name: "Coding & Software Engineering",
    description: "Benchmarks testing code generation, bug fixing, and real-world software engineering tasks.",
    color: "#3b82f6",
    icon: "Code2",
  },
  {
    slug: "math",
    name: "Mathematical Reasoning",
    description: "From grade-school word problems to olympiad-level competition mathematics.",
    color: "#8b5cf6",
    icon: "Calculator",
  },
  {
    slug: "reasoning",
    name: "Reasoning & Knowledge",
    description: "Logic, commonsense inference, expert science, and broad academic knowledge.",
    color: "#f59e0b",
    icon: "Brain",
  },
  {
    slug: "knowledge",
    name: "Knowledge",
    description: "Broad academic knowledge across dozens of subjects and domains.",
    color: "#f59e0b",
    icon: "BookOpen",
  },
  {
    slug: "agent",
    name: "Agent Tasks",
    description: "Multi-turn autonomous tasks: web browsing, tool use, OS interaction, and customer service.",
    color: "#10b981",
    icon: "Bot",
  },
  {
    slug: "human-preference",
    name: "Human Preference",
    description: "Crowdsourced Elo ratings from real users in pairwise model comparisons.",
    color: "#ec4899",
    icon: "Users",
  },
  {
    slug: "real-work",
    name: "Real Human Work",
    description: "Professional-grade evaluations: actual paid work from Upwork, Wall Street, law firms, and hospitals.",
    color: "#ef4444",
    icon: "Briefcase",
  },
  {
    slug: "contamination-resistant",
    name: "Contamination-Resistant",
    description: "Benchmarks designed to stay fresh — monthly rotating questions that models can't memorize.",
    color: "#06b6d4",
    icon: "RefreshCw",
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
