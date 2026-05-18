// ─── Benchmarks ───────────────────────────────────────────────────────────────
// Build-time bundle, still the source of truth for the LLM benchmark pages
// until the LLM crawl migrates to the camelCase Benchmark shape. Agent pages
// no longer use a build-time bundle — they read $DATA_DIR/agents.json at
// request time via `src/data/loaders.ts` so crawl-discovered entries surface
// without a rebuild.
import swebench from "./benchmarks/swe-bench.json";
import humaneval from "./benchmarks/humaneval.json";
import swelancer from "./benchmarks/swe-lancer.json";
import livecodebench from "./benchmarks/livecodebench.json";
import mathBench from "./benchmarks/math.json";
import gsm8k from "./benchmarks/gsm8k.json";
import gpqa from "./benchmarks/gpqa.json";
import mmlu from "./benchmarks/mmlu.json";
import aime from "./benchmarks/aime.json";
import bigbenchHard from "./benchmarks/bigbench-hard.json";
import truthfulqa from "./benchmarks/truthfulqa.json";
import arc from "./benchmarks/arc.json";
import hellaswag from "./benchmarks/hellaswag.json";
import gaia from "./benchmarks/gaia.json";
import webarena from "./benchmarks/webarena.json";
import agentbench from "./benchmarks/agentbench.json";
import taubench from "./benchmarks/tau-bench.json";
import theagentcompany from "./benchmarks/the-agent-company.json";
import chatbotArena from "./benchmarks/chatbot-arena.json";
import livebench from "./benchmarks/livebench.json";

import type { Benchmark } from "@/lib/types";

export const ALL_BENCHMARKS: Benchmark[] = [
  swebench,
  humaneval,
  swelancer,
  livecodebench,
  mathBench,
  gsm8k,
  gpqa,
  mmlu,
  aime,
  bigbenchHard,
  truthfulqa,
  arc,
  hellaswag,
  gaia,
  webarena,
  agentbench,
  taubench,
  theagentcompany,
  chatbotArena,
  livebench,
] as Benchmark[];

export const BENCHMARK_MAP = Object.fromEntries(ALL_BENCHMARKS.map((b) => [b.slug, b]));
