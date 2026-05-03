// ─── Benchmarks ───────────────────────────────────────────────────────────────
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

// ─── Agent Systems ────────────────────────────────────────────────────────────
import mercorApex from "./agents/mercor-apex.json";
import gdpval from "./agents/gdpval.json";
import rli from "./agents/rli.json";
import upworkHapi from "./agents/upwork-hapi.json";
import metrTimeHorizon from "./agents/metr-time-horizon.json";
import bigLawBench from "./agents/biglaw-bench.json";

import type { Benchmark, AgentSystem } from "@/lib/types";

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

export const ALL_AGENTS: AgentSystem[] = [
  mercorApex,
  gdpval,
  rli,
  upworkHapi,
  metrTimeHorizon,
  bigLawBench,
] as AgentSystem[];

export const BENCHMARK_MAP = Object.fromEntries(ALL_BENCHMARKS.map((b) => [b.slug, b]));
export const AGENT_MAP = Object.fromEntries(ALL_AGENTS.map((a) => [a.slug, a]));
