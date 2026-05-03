# BUILDPLAN — benchmark.darvinyi.com

> **For K2.6 (or any model building this site):** Read this entire file before writing a single line of UI code. All data files already exist. Your job is to build the Next.js 15 app on top of them.

---

## What This Is

A dark, data-dense benchmark exploration website deployed at `benchmark.darvinyi.com` via Railway. It covers 20 LLM benchmarks and 6 agentic AI evaluation systems. The site helps users understand what each benchmark tests, see real task examples, explore compiled results, and compare models side-by-side.

**Stack:**
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- Recharts (charts)
- pnpm
- Railway (Dockerfile already written)

---

## What Already Exists (DO NOT RE-CREATE)

```
src/
  lib/
    types.ts          ✅ All TypeScript interfaces
  data/
    models.ts         ✅ 18 curated frontier models
    categories.ts     ✅ 8 benchmark categories
    index.ts          ✅ Central export for all benchmarks + agents
    benchmarks/
      swe-bench.json       ✅ Full data + examples + results
      humaneval.json       ✅
      swe-lancer.json      ✅
      livecodebench.json   ✅
      math.json            ✅
      gsm8k.json           ✅
      gpqa.json            ✅
      mmlu.json            ✅
      aime.json            ✅
      bigbench-hard.json   ✅
      truthfulqa.json      ✅
      arc.json             ✅
      hellaswag.json       ✅
      gaia.json            ✅
      webarena.json        ✅
      agentbench.json      ✅
      tau-bench.json       ✅
      the-agent-company.json ✅
      chatbot-arena.json   ✅
      livebench.json       ✅
    agents/
      mercor-apex.json     ✅ (REQUIRED — one of 4 mandatory)
      gdpval.json          ✅ (REQUIRED — one of 4 mandatory)
      rli.json             ✅ (REQUIRED — one of 4 mandatory)
      upwork-hapi.json     ✅ (REQUIRED — one of 4 mandatory)
      metr-time-horizon.json ✅
      biglaw-bench.json    ✅
package.json          ✅
next.config.ts        ✅
tsconfig.json         ✅
postcss.config.mjs    ✅
Dockerfile            ✅
```

---

## Site Architecture

```
/                              Home page
/benchmarks                    Browse all benchmarks grid
/benchmarks/[slug]             Individual benchmark deep-dive
/agents                        Agentic systems overview
/agents/[slug]                 Individual agent system page
/leaderboard                   Aggregated model × benchmark table
/compare                       Side-by-side model comparison tool
```

---

## Design System

### Theme
Dark background, monospace accents. Feels like a technical dashboard, not a marketing site.

```
Background:    #09090b  (zinc-950)
Surface:       #18181b  (zinc-900)
Surface-2:     #27272a  (zinc-800)
Border:        #3f3f46  (zinc-700)
Text-primary:  #fafafa  (zinc-50)
Text-muted:    #a1a1aa  (zinc-400)
Text-subtle:   #71717a  (zinc-500)
Accent-blue:   #3b82f6
Accent-green:  #10b981
Accent-amber:  #f59e0b
Accent-red:    #ef4444
Accent-purple: #8b5cf6
```

### Saturation Status Badge Colors
```
active:              green  (#10b981)
nearing-saturation:  amber  (#f59e0b)
saturated:           zinc   (#71717a)
contaminated:        red    (#ef4444)
```

### Category Badge Colors (from categories.ts)
```
coding:                  #3b82f6 (blue)
math:                    #8b5cf6 (purple)
reasoning/knowledge:     #f59e0b (amber)
agent:                   #10b981 (green)
human-preference:        #ec4899 (pink)
real-work:               #ef4444 (red)
contamination-resistant: #06b6d4 (cyan)
```

### Typography
- Headers: font-semibold or font-bold, zinc-50
- Body: text-sm or text-base, zinc-300
- Captions/labels: text-xs, zinc-400 or zinc-500
- Code/examples: font-mono, text-sm, zinc-300

---

## Page Specifications

### 1. Layout (src/app/layout.tsx)
Global layout wrapping all pages.

```tsx
// Navbar items:
// - "Benchmarks" → /benchmarks
// - "Agent Evals" → /agents
// - "Leaderboard" → /leaderboard
// - "Compare" → /compare

// Logo: "benchmark" in monospace + ".darvinyi.com" in zinc-500
// Footer: minimal — just the site name and "benchmark.darvinyi.com"
```

---

### 2. Home Page (src/app/page.tsx)

**Sections (top to bottom):**

#### Hero
```
Headline: "The AI Benchmark Explorer"
Subhead: "Deep-dives into every major LLM benchmark — what they test, how they work, 
           and where the models actually stand."
CTA buttons: "Explore Benchmarks" → /benchmarks  |  "View Leaderboard" → /leaderboard
```

#### Stats Bar (4 numbers)
```
20 Benchmarks Covered
6 Agentic Evaluations
18 Curated Models
[Year] Updated
```

#### Category Grid
8 clickable cards, one per category. Each shows:
- Category icon + name
- Short description
- Benchmark count
- Color accent from category color

On click: navigate to /benchmarks filtered by that category.

#### Featured: "The Real Work Gap" Section
Highlight the dramatic gap between benchmark scores and real-world automation:
- SWE-bench Pro top score: 58.6% (Kimi K2.6)
- GAIA top score: 67% (OpenAI Deep Research)
- RLI Automation Rate (real Upwork projects): 2.5% (best agent)

Visual: three stat cards showing this gap. Caption explaining why this matters.

#### Benchmark Status Overview
A 2-column grid showing all 20 benchmarks with their saturation status badge.
Group by: Active | Contaminated | Saturated.

---

### 3. Benchmarks Browse Page (src/app/benchmarks/page.tsx)

Grid of benchmark cards. Each card shows:
- Benchmark name
- Short description (1 sentence)
- Category badge
- Saturation status badge
- Top model + score (first result from results array)
- Year created

Filter bar at top:
- Filter by category (tabs or pills)
- Sort by: Name | Year | Top Score

---

### 4. Benchmark Detail Page (src/app/benchmarks/[slug]/page.tsx)

This is the most important page. Fetch data from `BENCHMARK_MAP[slug]`.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Back to Benchmarks]                                             │
│                                                                  │
│ [Category Badge] [Saturation Badge]                              │
│                                                                  │
│ # Benchmark Name                                                 │
│ Short description                                                │
│                                                                  │
│ ── Quick Stats ────────────────────────────────────────────────  │
│ [Tasks: N]  [Year: YYYY]  [Creator: ...]  [Top Score: XX%]      │
│                                                                  │
│ ── What it Tests ───────────────────────────────────────────── │
│ Full description paragraphs                                      │
│                                                                  │
│ ── Task Anatomy ────────────────────────────────────────────── │
│ Input: ...                                                       │
│ Output: ...                                                      │
│ Evaluation: ...                                                  │
│ Metric: ...                                                      │
│                                                                  │
│ ── Example Tasks ───────────────────────────────────────────── │
│ Accordion/tab for each example:                                  │
│   Title + difficulty badge                                       │
│   Input (code block for code, prose for text)                   │
│   Solution (collapsible)                                         │
│   Answer (highlighted)                                           │
│   Notes                                                          │
│                                                                  │
│ ── Leaderboard Results ─────────────────────────────────────── │
│ Sortable table:                                                  │
│   Rank | Model (with org color dot) | Score | Date | Setup      │
│   [V] = vendor reported badge                                    │
│                                                                  │
│ ── Score Over Time (Line Chart) ──────────────────────────────  │
│ Recharts LineChart showing score by date per model               │
│ Only show models that have multiple data points                  │
│                                                                  │
│ ── Key Findings ────────────────────────────────────────────── │
│ Bullet list from keyFindings[]                                   │
│                                                                  │
│ ── Variants ────────────────────────────────────────────────── │
│ Cards linking to related benchmark slugs                         │
│                                                                  │
│ ── Controversies & Caveats ─────────────────────────────────── │
│ Each controversy as a card with warning icon                     │
│                                                                  │
│ ── Links ───────────────────────────────────────────────────── │
│ [Paper] [ArXiv] [Dataset] [Leaderboard] [GitHub]                │
└─────────────────────────────────────────────────────────────────┘
```

**Important rendering notes:**
- Code in examples should use `<pre><code>` with a dark code block style
- Saturation badge "contaminated" gets a red warning border on the whole page header
- Vendor-reported scores get a small [V] badge with tooltip "Self-reported by the model's creator"
- The score table should sort by score descending by default

---

### 5. Agents Browse Page (src/app/agents/page.tsx)

Similar to benchmarks but for the 6 agent systems. Show:
- 4 required systems prominently at top with a "Required" badge
- Key stat: automation rate or top Pass@1
- A brief "why it's unique" bullet

Also include: a summary callout explaining what "real work benchmarks" are vs. academic benchmarks.

---

### 6. Agent Detail Page (src/app/agents/[slug]/page.tsx)

Similar structure to benchmark detail:
- Description
- Task anatomy (the workplace setup section)
- 3 example tasks (styled like case studies — more narrative than benchmark examples)
- Results table (with domain breakdowns where available)
- Key findings
- What makes it unique (bulleted list)
- Controversies
- Links

Special for the 4 required systems: add a "Human vs. AI" comparison visualization if data supports it (e.g., RLI's 2.5% vs. human 100%, HAPI's before/after bars).

---

### 7. Leaderboard Page (src/app/leaderboard/page.tsx)

**The big aggregated table.** This is a key page.

Construction:
1. Gather all `results` arrays from all benchmarks + agents
2. Build a model × benchmark matrix
3. Show as a wide, horizontally-scrollable table

```
Model          | Org  | SWE-Pro | GPQA | MATH | AIME | LiveCB | MMLU | BBH | ...
────────────────────────────────────────────────────────────────────────────────
GPT-5          | OpenAI | 23.3%  | 75% | 94%  | 94%  | 79%   | 91%  | 91% |
Claude Opus 4.6| Anthro | 45.9%  | 88% | 90%  | 80%  | 76%   | 91%  | 93% |
...
```

- Cells use a heatmap coloring: green=high, amber=medium, red=low relative to max score for that benchmark
- Empty cells (no data) shown as `—`
- Clicking a benchmark column header goes to `/benchmarks/[slug]`
- Clicking a model row shows model detail in a sidebar or expands inline
- Filter: show only certain categories of benchmarks
- Sticky first column (model name)

---

### 8. Compare Page (src/app/compare/page.tsx)

Select 2-4 models from dropdowns. See their scores side-by-side.

**Two views:**
1. **Radar chart** (Recharts RadarChart) — one axis per benchmark category, showing relative capability profile
2. **Table view** — detailed scores on every benchmark

Model selector: colored pills matching each model's org color.

Show pricing comparison at bottom: cost per million tokens for selected models.

---

## Component Architecture

```
src/components/
  layout/
    Navbar.tsx          — Site navigation
    Footer.tsx          — Minimal footer
  ui/
    Badge.tsx           — Category/saturation/vendor badges
    Card.tsx            — Reusable card container
    CodeBlock.tsx       — Syntax-highlighted code display
    StatCard.tsx        — Number + label stat display
    Tooltip.tsx         — Hover tooltips
    EmptyCell.tsx       — The "—" placeholder for missing data
  benchmarks/
    BenchmarkCard.tsx   — Grid card for browse page
    BenchmarkTable.tsx  — Leaderboard results table
    ExampleBlock.tsx    — Task example display (input/solution/answer)
    SaturationBadge.tsx — Color-coded saturation status
    VariantCard.tsx     — Related benchmark variant card
  charts/
    ScoreLineChart.tsx  — Score progression over time
    RadarChart.tsx      — Model capability radar (Compare page)
    HeatmapTable.tsx    — Leaderboard heat-mapped table
    BeforeAfterBar.tsx  — HAPI before/after comparison bars
  agents/
    AgentCard.tsx       — Grid card for agents browse page
    AgentExample.tsx    — Case study style example display
    HumanVsAI.tsx       — Human baseline vs. AI score visualization
```

---

## Key Data Access Patterns

```typescript
// Get all benchmarks
import { ALL_BENCHMARKS } from "@/data";

// Get a specific benchmark
import { BENCHMARK_MAP } from "@/data";
const benchmark = BENCHMARK_MAP["swe-bench"];

// Get all agents
import { ALL_AGENTS } from "@/data";

// Get a model's details
import { MODEL_MAP } from "@/data/models";
const model = MODEL_MAP["gpt-5"];

// Get category metadata
import { CATEGORY_MAP } from "@/data/categories";
const cat = CATEGORY_MAP["coding"];

// Get all results flattened (for leaderboard)
import { ALL_BENCHMARKS } from "@/data";
const allResults = ALL_BENCHMARKS.flatMap(b => b.results.map(r => ({ ...r, benchmarkSlug: b.slug, benchmarkName: b.name })));
```

---

## Research Session IDs (for additional context if needed)

If you need to look up additional details about any benchmark or agent system, these sub-agent research sessions can be resumed:

- **Coding benchmarks** (SWE-bench, HumanEval, LiveCodeBench, SWE-Lancer): `ses_2142000c9ffecy4jn39vfM9VoX`
- **Math & reasoning benchmarks** (MATH, GSM8K, GPQA, MMLU, BBH, TruthfulQA, AIME): `ses_2141b8dc5ffeV7N6nwVh7xOYID`
- **Agent & knowledge benchmarks** (GAIA, WebArena, AgentBench, tau-bench, TheAgentCompany, Chatbot Arena, LiveBench, ARC, HellaSwag): `ses_214169256ffe7rdlns78bu6bMy`
- **Real work agentic systems** (APEX, GDPval, RLI, HAPI, METR, BigLaw Bench): `ses_2140e0088ffemD2fOrRbWKeznJ`
- **LLM benchmarks initial research**: `ses_21431dc4dffeUFxsNX7y77yl5f`
- **Agentic systems initial research**: `ses_2142f0fd0ffepOLGzRIxD2nAav`
- **Model results data**: `ses_2140803b7ffeTvW7ob1ZQCFRn4`

---

## Railway Deployment

The Dockerfile is already written using Next.js standalone output.

Railway setup:
1. Connect GitHub repo
2. Railway auto-detects Dockerfile
3. Set environment variables (none required for this static-data site)
4. Custom domain: `benchmark.darvinyi.com`

The `next.config.ts` has `output: "standalone"` set.

---

## Build Order

Build in this exact order to avoid dependency issues:

1. `src/app/globals.css` — Tailwind v4 imports + CSS variables
2. `src/app/layout.tsx` — Root layout with Navbar + Footer
3. `src/components/ui/` — All primitive components
4. `src/components/charts/` — Recharts wrappers
5. `src/components/benchmarks/` — Benchmark-specific components
6. `src/components/agents/` — Agent-specific components
7. `src/app/page.tsx` — Home page
8. `src/app/benchmarks/page.tsx` — Browse page
9. `src/app/benchmarks/[slug]/page.tsx` — Detail page ← most complex
10. `src/app/agents/page.tsx` — Agents browse
11. `src/app/agents/[slug]/page.tsx` — Agent detail
12. `src/app/leaderboard/page.tsx` — Leaderboard table
13. `src/app/compare/page.tsx` — Compare tool

---

## Critical Implementation Notes

1. **All data is static** — no API calls, no database, no server actions needed. Everything comes from `src/data/`.

2. **JSON imports** — `resolveJsonModule: true` is set in tsconfig. Import JSON files directly with `import data from "./benchmarks/swe-bench.json"`.

3. **The `results` array in benchmarks** uses `modelId` strings that must match `Model.id` values in `models.ts`. Use `MODEL_MAP[result.modelId]` to get model details.

4. **Vendor-reported badge**: `result.isVendorReported === true` → show small `[V]` badge with tooltip "Score reported by the model's creator, not independently verified."

5. **Recharts in Next.js**: use `"use client"` directive on all chart components. Recharts doesn't SSR.

6. **Tailwind v4**: uses `@tailwindcss/postcss` not the old postcss plugin. CSS imports use `@import "tailwindcss"` not `@tailwind base/components/utilities`.

7. **Score formatting**: scores are stored as raw numbers (0-100 for percentages, raw Elo for Arena, raw minutes for METR). Each result has a `scoreLabel` string that is the formatted display version. Always show `scoreLabel` in the UI, use `score` (number) for sorting/charting.

8. **Missing data**: Many model×benchmark combinations have no data. The leaderboard must handle `undefined` gracefully and show `—`.

9. **generateStaticParams**: Use this for both `/benchmarks/[slug]` and `/agents/[slug]` to enable static generation.

---

## Content Accuracy Notes

Key facts to preserve accurately in any UI copy:

- SWE-bench Verified was **deprecated February 23, 2026** due to contamination — not just "hard"
- RLI top automation rate is **2.5%** (not 25% — easy typo to make)
- HAPI found **up to 70%** improvement from human collaboration (not 70% completion rate)
- METR time horizon for Claude Opus 4.6 is **~14.5 hours** with a CI of **6h–98h** (wide)
- GPQA Diamond has **198 questions** (not 546 — that's the Extended set)
- GDPval gold subset is **220 tasks** (not 1,320 — that's the full set)
- The 4 **required** agent systems are: Mercor APEX, GDPval, RLI, Upwork HAPI

---

## What "Build It Now" Means

Run `pnpm install` first, then build all components and pages. After building, run `pnpm dev` to verify it runs. The site should compile with `pnpm build` with zero TypeScript errors.

Good luck. The data is ready. Build something great.
