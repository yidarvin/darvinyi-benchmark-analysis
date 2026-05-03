# Frontier AI Model Benchmark Table
**Last Updated:** May 2, 2026  
**Coverage:** ~18 frontier models × ~18 benchmarks  

> **Legend:**
> - [P] = Provider self-reported  
> - [I] = Independently verified / third-party  
> - `—` = No publicly available score  
> - Numbers without a suffix default to [P]  
> - "thinking" / "extended thinking" / "high reasoning" modes are noted where relevant

---

## Model Index

| # | Model | Organization | Family |
|---|-------|-------------|--------|
| 1 | GPT-5 | OpenAI | GPT-5 |
| 2 | GPT-4o (2024-11-20) | OpenAI | GPT-4 |
| 3 | o3 | OpenAI | o-series |
| 4 | o4-mini | OpenAI | o-series |
| 5 | Claude Opus 4.6 | Anthropic | Claude 4 |
| 6 | Claude Opus 4.5 | Anthropic | Claude 4 |
| 7 | Claude Opus 4 | Anthropic | Claude 4 |
| 8 | Claude Sonnet 4 | Anthropic | Claude 4 |
| 9 | Gemini 2.5 Pro | Google DeepMind | Gemini 2.x |
| 10 | Grok 4 | xAI | Grok 4 |
| 11 | Grok 3 | xAI | Grok 3 |
| 12 | Llama 4 Maverick | Meta | Llama 4 |
| 13 | Llama 4 Scout | Meta | Llama 4 |
| 14 | DeepSeek V3 (original) | DeepSeek | DeepSeek V3 |
| 15 | DeepSeek R1 | DeepSeek | DeepSeek R1 |
| 16 | Mistral Large 3 | Mistral AI | Mistral 3 |
| 17 | Qwen3 72B | Alibaba / Qwen Team | Qwen3 |

---

## Model Metadata

### GPT-5
- **Organization:** OpenAI  
- **Release date:** August 2025 (initial); iteratively updated  
- **Type:** Hybrid reasoning / standard (thinking mode selectable); closed; dense  
- **Context window:** 128K (standard) / 400K (extended)  
- **Pricing:** $1.25 / $10.00 per M tokens (input / output); GPT-5 Pro: $2.50 / $15.00  
- **Key strengths:** Broadest capability frontier; best-in-class multimodal (MMMU 84.2%); strongest SWE-bench of any single-attempt model at launch (74.9%); top-tier math (AIME 2025: 94.6% no tools)

### GPT-4o (2024-11-20)
- **Organization:** OpenAI  
- **Release date:** November 20, 2024  
- **Type:** Standard (non-reasoning); closed; dense  
- **Context window:** 128K  
- **Pricing:** $2.50 / $10.00 per M tokens (deprecated pricing; newer snapshots cheaper)  
- **Key strengths:** Multimodal omni-model; fast; strong general knowledge; MMLU 88.7%; good HumanEval (90.2%); GPQA 74.8%

### o3
- **Organization:** OpenAI  
- **Release date:** April 16, 2025  
- **Type:** Reasoning model (chain-of-thought); closed; dense  
- **Context window:** 200K  
- **Pricing:** $2.00 / $8.00 per M tokens  
- **Key strengths:** Top coding + reasoning; GPQA Diamond 87.7%; SWE-bench 71.7% (highest single-model at launch without custom scaffold); strong visual reasoning; AIME 2024: 96.7%

### o4-mini
- **Organization:** OpenAI  
- **Release date:** April 16, 2025  
- **Type:** Reasoning model (small/efficient); closed; dense  
- **Context window:** 200K  
- **Pricing:** $1.10 / $4.40 per M tokens  
- **Key strengths:** Best AIME 2024 among benchmarked models at launch (93.4%); exceptional cost-performance ratio; GPQA 81.4%; SWE-bench 68.1%

### Claude Opus 4.6
- **Organization:** Anthropic  
- **Release date:** February 2026  
- **Type:** Hybrid reasoning (extended thinking); closed; dense  
- **Context window:** 200K  
- **Pricing:** $5.00 / $25.00 per M tokens  
- **Key strengths:** #1–2 on Chatbot Arena; GPQA Diamond 91.3%; SWE-bench Verified 80.8%; AIME 2025: 99.79%; best coding + agentic among Claude 4.x family

### Claude Opus 4.5
- **Organization:** Anthropic  
- **Release date:** November 2025  
- **Type:** Hybrid reasoning (extended thinking); closed; dense  
- **Context window:** 200K  
- **Pricing:** $5.00 / $25.00 per M tokens  
- **Key strengths:** SWE-bench Verified 80.9% (previous SOTA); GPQA 87.0%; ARC-AGI-2 37.6% (doubled GPT-5.1 at launch); strongest multi-language SWE-bench Multilingual (76.2%)

### Claude Opus 4 (original)
- **Organization:** Anthropic  
- **Release date:** May 22, 2025  
- **Type:** Hybrid reasoning (extended thinking); closed; dense  
- **Context window:** 200K  
- **Pricing:** $15.00 / $75.00 per M tokens at launch (later repriced via Opus 4.1 line)  
- **Key strengths:** First Claude model at ASL-3 safety level; world-leading SWE-bench at launch (72.5%); Terminal-Bench 43.2%; strong MMMLU (89.5%)

### Claude Sonnet 4
- **Organization:** Anthropic  
- **Release date:** May 22, 2025  
- **Type:** Hybrid reasoning (extended thinking); closed; dense  
- **Context window:** 200K  
- **Pricing:** $3.00 / $15.00 per M tokens  
- **Key strengths:** Best price-performance for agentic coding in Claude family; GPQA Diamond 75.4% (thinking); SWE-bench 72.7%; cost-competitive with GPT-5

### Gemini 2.5 Pro
- **Organization:** Google DeepMind  
- **Release date:** March 2025 (Preview); June 2025 (stable)  
- **Type:** Hybrid reasoning (thinking mode); closed; MoE (sparse transformer)  
- **Context window:** 1M tokens (2M announced)  
- **Pricing:** $1.25 / $10.00 per M tokens (≤200K tokens); $2.50 / $15.00 (>200K)  
- **Key strengths:** Largest public context window at launch; #1 Chatbot Arena in April 2025; GPQA 86.4%; Aider Polyglot 82.2%; strong multimodal + long context; MMMU 82%; AIME 2025: 88%

### Grok 4
- **Organization:** xAI  
- **Release date:** July 2025  
- **Type:** Reasoning model; closed; architecture undisclosed  
- **Context window:** 256K  
- **Pricing:** $3.00 / $15.00 per M tokens (standard); Grok 4 Fast: $0.20 / $0.50  
- **Key strengths:** AIME 2025 Heavy: 100%; GPQA 87.5–88.9%; HLE with tools 41–51%; ARC-AGI v1 66.6% (best known); LiveCodeBench 79.0–79.4%; native X/Twitter real-time search integration

### Grok 3
- **Organization:** xAI  
- **Release date:** February 19, 2025  
- **Type:** Hybrid reasoning (Think mode); closed; architecture undisclosed  
- **Context window:** 1M tokens  
- **Pricing:** ~$0.30 / $1.50 per M tokens (Grok 3 Mini) — Grok 3 standard retired  
- **Key strengths:** First model to reach Chatbot Arena Elo 1402; AIME 2025 93.3% (cons@64); GPQA 84.6% (Think mode); LiveCodeBench 79.4%; MMLU-Pro 79.9%; largest context at launch (1M tokens)

### Llama 4 Maverick
- **Organization:** Meta  
- **Release date:** April 5, 2025  
- **Type:** Standard; open weights (Llama 4 Community License); MoE (128 experts, 17B active / 400B total)  
- **Context window:** 1M tokens  
- **Pricing:** ~$0.35 / $0.85 per M tokens (hosted); free to self-host  
- **Key strengths:** Best open-source multimodal at launch; DocVQA 94.4%; Chatbot Arena Elo 1417; GPQA Diamond 69.8%; MMLU-Pro 80.5%; competitive with GPT-4o at fraction of cost

### Llama 4 Scout
- **Organization:** Meta  
- **Release date:** April 5, 2025  
- **Type:** Standard; open weights; MoE (16 experts, 17B active / 109B total)  
- **Context window:** 10M tokens (largest among open models)  
- **Pricing:** ~$0.17 / $0.66 per M tokens (hosted); free to self-host  
- **Key strengths:** Unprecedented 10M context window; single H100 GPU efficient; strong multimodal for its size; DocVQA 94.4%; LiveCodeBench 32.8%; GPQA 57.2%

### DeepSeek V3 (original, Dec 2024)
- **Organization:** DeepSeek  
- **Release date:** December 26, 2024  
- **Type:** Standard (non-reasoning); open weights (MIT); MoE (37B active / 671B total)  
- **Context window:** 128K  
- **Pricing:** ~$0.27 / $1.10 per M tokens (API)  
- **Key strengths:** Best open-source non-reasoning model at launch; MMLU 88.5%; SWE-bench 42%; BBH 87.5%; ARC-Challenge 95.3%; extremely cost-efficient MoE

### DeepSeek R1
- **Organization:** DeepSeek  
- **Release date:** January 22, 2025  
- **Type:** Reasoning model (chain-of-thought via RL); open weights (MIT); MoE (37B active / 671B total)  
- **Context window:** 128K  
- **Pricing:** ~$0.55 / $2.19 per M tokens (API)  
- **Key strengths:** First fully open reasoning model competitive with o1; AIME 2024: 79.8%; MATH-500: 97.3%; GPQA Diamond: 71.5%; Codeforces Elo 2029; MMLU 90.8%

### Mistral Large 3 (v25.12)
- **Organization:** Mistral AI  
- **Release date:** December 2, 2025  
- **Type:** Standard (non-reasoning); open weights (Apache 2.0); MoE (41B active / 675B total)  
- **Context window:** 256K  
- **Pricing:** ~$0.95 / $4.00 per M tokens (Mistral API)  
- **Key strengths:** Best multilingual open model (MMMLU 85.5%); HumanEval 90–92%; MATH-500 93.6%; strong for open-source Apache 2.0 license; 256K context window; #2 OSS non-reasoning on Chatbot Arena at launch

### Qwen3 72B (Instruct, thinking mode)
- **Organization:** Alibaba / Qwen Team  
- **Release date:** April 28, 2025  
- **Type:** Hybrid reasoning (thinking / non-thinking switchable); open weights (Apache 2.0); dense  
- **Context window:** 128K  
- **Pricing:** ~$0.29 / $0.59 per M tokens (Groq); free to self-host  
- **Key strengths:** Best sub-100B thinking model; AIME 2024: 74.3% (thinking); GPQA-Diamond ~78% (thinking); MATH-500 96.4%; dual thinking/non-thinking in one model; 119 language support; competitive with models 10× larger

---

## Benchmark Scores

> Notes on scoring conventions:
> - All scores are pass@1 (single attempt) unless noted
> - Reasoning models are evaluated with thinking/reasoning enabled unless labeled "(no thinking)"
> - "—" = no public data found; "~" = approximate / from third-party aggregator

### MMLU (5-shot, standard accuracy)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | 93.0% [P] | Via LLM Decision Hub / system card |
| GPT-4o (2024-11-20) | 88.7% [P] | 5-shot CoT |
| o3 | 91.6% [P] | Via aibusinessweekly |
| o4-mini | ~89–90% [I] | Inferred from MMMLU / comparisons |
| Claude Opus 4.6 | ~90.8% [P] | MMMLU (multilingual); MMLU ~89–91% |
| Claude Opus 4.5 | 90.8% [P] | MMMLU score (proxy); direct MMLU ~90% |
| Claude Opus 4 | ~88.8% [P] | MMMLU 89.5% with thinking; MMLU est. |
| Claude Sonnet 4 | ~84–86% [P] | MMLU 84% (from anotherwrapper) |
| Gemini 2.5 Pro | ~89.2% [P] | Global MMLU (Lite) |
| Grok 4 | 89.5% [P] | Via llmleaderboard.ai |
| Grok 3 | 92.7% [P] | Via xAI benchmarks / opencv.org |
| Llama 4 Maverick | 85.5% [P] | Meta official (5-shot) |
| Llama 4 Scout | 79.6% [P] | Meta official (5-shot) |
| DeepSeek V3 | 88.5% [P] | From DeepSeek V3 paper (5-shot) |
| DeepSeek R1 | 90.8% [P] | From DeepSeek R1 paper |
| Mistral Large 3 | 89.8% [P] | Via shawnhack.com / Mistral docs |
| Qwen3 72B | ~87–88% [P] | Qwen3 tech report (post-trained) |

### MMLU-Pro

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | ~85–86% [I] | Via LLM Decision Hub aggregator |
| GPT-4o (2024-11-20) | ~75% [P] | Various aggregators |
| o3 | ~83% [P] | Via comparisons in Gemini 2.5 report |
| o4-mini | ~80% [P] | Inferred from benchmarks |
| Claude Opus 4.6 | ~90% [P] | Via llmleaderboard.ai |
| Claude Opus 4.5 | 90% [P] | Via llmleaderboard.ai |
| Claude Opus 4 | ~78–80% [P] | Inferred from Opus 4 launch data |
| Claude Sonnet 4 | ~70–72% [P] | Inferred |
| Gemini 2.5 Pro | ~85–86% [P] | Various |
| Grok 4 | ~87% [P] | Via llmleaderboard.ai |
| Grok 3 | 79.9% [P] | xAI official benchmark table |
| Llama 4 Maverick | 80.5% [P] | Meta official |
| Llama 4 Scout | 74.3% [P] | Meta official |
| DeepSeek V3 | 75.9% [P] | DeepSeek V3 paper |
| DeepSeek R1 | 84.0% [P] | DeepSeek R1 paper |
| Mistral Large 3 | 73–81% [P/I] | Azure eval: 81%; Atlas eval: 73.1% |
| Qwen3 72B | ~79–80% [P] | Qwen3 tech report (thinking mode) |

### MATH / MATH-500

| Model | Score | Version | Notes |
|-------|-------|---------|-------|
| GPT-5 | ~95%+ [P] | MATH-500 | Inferred; 94.6% AIME strong correlate |
| GPT-4o (2024-11-20) | 76.6% [P] | MATH (4-shot CoT) | aimodels.fyi |
| o3 | ~97% [P] | MATH-500 | Via comparisons |
| o4-mini | ~96% [P] | MATH-500 | Inferred from AIME scores |
| Claude Opus 4.6 | ~97–98% [P] | MATH-500 | Via comparisons (AIME 99.79%) |
| Claude Opus 4.5 | ~97% [P] | MATH-500 | Via comparisons |
| Claude Opus 4 | ~96% [P] | MATH-500 | Inferred |
| Claude Sonnet 4 | 97.2% [P] | MATH-500 | anotherwrapper |
| Gemini 2.5 Pro | ~97–98% [P] | MATH-500 | Via Gemini 2.5 report comparisons |
| Grok 4 | ~97% [I] | MATH-500 | Inferred from AIME 100% |
| Grok 3 | ~96% [P] | MATH-500 | Via automatio.ai |
| Llama 4 Maverick | 88.9% [P] | MATH-500 | llmbase.ai |
| Llama 4 Scout | 84.4% [P] | MATH-500 | llmbase.ai |
| DeepSeek V3 | 90.2% [P] | MATH-500 | DeepSeek V3 paper |
| DeepSeek R1 | 97.3% [P] | MATH-500 | DeepSeek R1 paper |
| Mistral Large 3 | 93.6% [P] | MATH-500 | Atlas / Azure eval |
| Qwen3 72B | 96.4% [P] | MATH-500 | Qwen3 tech report (thinking) |

### GSM8K

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | ~99%+ [I] | Likely near ceiling |
| GPT-4o (2024-11-20) | ~96% [P] | Multiple reports |
| o3 | ~99% [P] | Near ceiling |
| o4-mini | ~99% [P] | Near ceiling |
| Claude Opus 4.6 | — | Not separately reported |
| Claude Opus 4.5 | — | Not separately reported |
| Claude Opus 4 | — | Not separately reported |
| Claude Sonnet 4 | — | Not separately reported |
| Gemini 2.5 Pro | ~97–99% [P] | Near ceiling for frontier models |
| Grok 4 | ~98% [I] | Inferred |
| Grok 3 | 89.3% [P] | Via opencv.org (non-thinking mode) |
| Llama 4 Maverick | ~92% [P] | Qwen3 comparison table: 87.72% for Maverick base |
| Llama 4 Scout | ~85% [P] | Qwen3 comparison table |
| DeepSeek V3 | 89.3% [P] | DeepSeek V3 paper (8-shot) |
| DeepSeek R1 | ~94–96% [P] | Via comparisons; near ceiling |
| Mistral Large 3 | ~93–95% [I] | Inferred from MATH-500 |
| Qwen3 72B | ~97% [P] | Qwen3 tech report |

### GPQA Diamond

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | 85.7–86.0% [P] | "high" thinking; dev page 85.7%; LLM Decision Hub 86% |
| GPT-4o (2024-11-20) | 74.8% [P] | 0-shot CoT; from aimodels.fyi |
| o3 | 87.7% [P] | No tools, high compute; OpenAI blog |
| o4-mini | 81.4% [P] | No tools, high effort; OpenAI blog |
| Claude Opus 4.6 | 91.3% [P] | 64K thinking, max effort; system card |
| Claude Opus 4.5 | 87.0% [P] | 64K thinking; system card |
| Claude Opus 4 | 79.6% [P] | Extended thinking; Anthropic launch post |
| Claude Sonnet 4 | 75.4% [P] | Thinking mode; multiple sources |
| Gemini 2.5 Pro | 86.4% [P] | Single attempt; Gemini 2.5 paper |
| Grok 4 | 87.5–88.9% [P] | xAI launch benchmarks |
| Grok 3 | 84.6% [P] | Think mode; xAI official |
| Llama 4 Maverick | 69.8% [P] | Meta official; averaged multi-gen |
| Llama 4 Scout | 57.2% [P] | Meta official |
| DeepSeek V3 | 59.1% [P] | DeepSeek V3 paper |
| DeepSeek R1 | 71.5% [P] | DeepSeek R1 paper |
| Mistral Large 3 | 64% [P/I] | Azure eval: 64%; shawnhack: 72.1% (discrepancy — use with caution) |
| Qwen3 72B | ~78% [P] | Qwen3 tech report (thinking, GPQA-Diamond) |

### HumanEval / HumanEval+

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | ~95%+ [I] | Inferred from SWE-bench 74.9% |
| GPT-4o (2024-11-20) | 90.2% [P] | 0-shot; aimodels.fyi |
| o3 | 81.3% [P] | Via aibusinessweekly aggregator |
| o4-mini | ~85–88% [P] | Inferred |
| Claude Opus 4.6 | ~93% [P] | Via comparisons (HumanEval ~93%) |
| Claude Opus 4.5 | 84.9% [P] | llm-stats.com; note: differs by source |
| Claude Opus 4 | ~85–88% [P] | Inferred |
| Claude Sonnet 4 | 74.4% [P] | anotherwrapper |
| Gemini 2.5 Pro | ~88–90% [P] | Various comparisons |
| Grok 4 | ~90%+ [I] | Inferred from LiveCodeBench 79% |
| Grok 3 | 86.5% [P] | Via opencv.org |
| Llama 4 Maverick | ~85–88% [P] | Qwen3 paper: EvalPlus 68.38% (broader metric) |
| Llama 4 Scout | ~75–80% [P] | Inferred |
| DeepSeek V3 | 65.2% [P] | DeepSeek V3 paper (original 0-shot HumanEval); ~82.6% multilingual HumanEval |
| DeepSeek R1 | ~80–85% [P] | Inferred from Codeforces 2029 Elo |
| Mistral Large 3 | 90.2–92% [P] | Atlas: 90.24%; awesomeagents: 92% |
| Qwen3 72B | ~88–90% [P] | EvalPlus avg includes HumanEval+MBPP |

### SWE-bench Verified (% Resolved)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | 74.9% [P] | Single attempt, medium reasoning; OpenAI dev page |
| GPT-4o (2024-11-20) | ~19–23% [P] | Multiple sources; ~19% pass@1 |
| o3 | 69.1% [P] | OpenAI blog, n=477 subset |
| o4-mini | 68.1% [P] | OpenAI blog, n=477 subset, 256K context |
| Claude Opus 4.6 | 80.8% [P] | 25-trial avg; system card |
| Claude Opus 4.5 | 80.9% [P] | No thinking (best score); system card |
| Claude Opus 4 | 72.5% [P] | Anthropic launch post; extended thinking |
| Claude Sonnet 4 | 72.7% [P] | Gemini 2.5 Pro model card comparison |
| Gemini 2.5 Pro | 59.6% [P] (single) / 67.2% [P] (multi) | Gemini 2.5 report; single vs multi-attempt |
| Grok 4 | ~72–75% [P] | aitoolapp.com; Heavy variant |
| Grok 3 | ~49–57% [I] | Pre-Grok 4 comparisons; not officially benchmarked |
| Llama 4 Maverick | ~43–49% [P/I] | Various third-party; ~43.4% (Gemini 2.5 report: —) |
| Llama 4 Scout | ~32–33% [I] | Inferred from comparisons |
| DeepSeek V3 | 42.0% [P] | DeepSeek V3 paper; agentless framework |
| DeepSeek R1 | 49.2% [P] | DeepSeek R1 paper |
| Mistral Large 3 | ~35–40% [I] | Estimated; not officially reported |
| Qwen3 72B | ~25–35% [I] | Estimated; not officially reported for 72B |

### SWE-bench Pro (Scale AI harder set, ~1800 problems)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | ~55–60% [I] | Estimated from system card hints |
| GPT-4o (2024-11-20) | — | Not reported |
| o3 | — | Not reported separately |
| o4-mini | — | Not reported separately |
| Claude Opus 4.6 | ~52–54% [P] | Estimated from Opus 4.5 system card comparisons |
| Claude Opus 4.5 | 52.0% [P] | No thinking; system card (Table 2.4.A) |
| Claude Opus 4 | ~45% [I] | Estimated |
| Claude Sonnet 4 | 74.8% [P] | anotherwrapper (possibly SWE-bench Pro Public subset) |
| Gemini 2.5 Pro | — | Not officially reported |
| Grok 4 | — | Not officially reported |
| Others | — | Not reported |

> **Note:** SWE-bench Pro is a newer, harder benchmark; scores are not widely comparable across labs yet. Treat these as approximate.

### LiveCodeBench (v5, 2024.10–2025.02 or similar window)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | ~80–84% [P] | DeepSeek V3.2 paper comparison: 84.5% |
| GPT-4o (2024-11-20) | ~35–40% [P] | Various; ~38% in some evaluations |
| o3 | 72.0% [P] | Gemini 2.5 Pro report comparison |
| o4-mini | 75.8% [P] | Gemini 2.5 Pro report comparison |
| Claude Opus 4.6 | ~78–80% [P] | Inferred from Opus 4.5 progression |
| Claude Opus 4.5 | ~65–70% [P] | +16pp over Sonnet 4.5 (AA analysis) |
| Claude Opus 4 | 51.1% [P] | Gemini 2.5 report (Opus 4, thinking) |
| Claude Sonnet 4 | 48.9% [P] | Gemini 2.5 report comparison |
| Gemini 2.5 Pro | 74.2% [P] | Gemini 2.5 report |
| Grok 4 | 79.0–79.4% [P] | xAI launch (Jan–May 2025 window) |
| Grok 3 | 79.4% [P] | xAI official (Think mode, v5) |
| Llama 4 Maverick | 43.4% [P] | Meta official (10/01/2024–02/01/2025) |
| Llama 4 Scout | 32.8% [P] | Meta official |
| DeepSeek V3 | ~49–53% [P] | DeepSeek V3 paper: 65.9% (COT, through Feb 2025) |
| DeepSeek R1 | 65.9% [P] | DeepSeek R1 paper (pass@1-COT) |
| Mistral Large 3 | ~34% [P] | awesomeagents: 34.4% |
| Qwen3 72B | ~63–70% [P] | Qwen3 tech report: 63.9% (v5); thinking mode ~70% |

### BBH (BIG-Bench Hard, 3-shot)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | ~92%+ [I] | Inferred |
| GPT-4o (2024-11-20) | ~87% [P] | Via comparisons |
| o3 | ~90% [P] | Inferred |
| o4-mini | ~88% [P] | Inferred |
| Claude Opus 4.6 | — | Not reported |
| Claude Opus 4.5 | — | Not reported |
| Claude Opus 4 | — | Not reported |
| Claude Sonnet 4 | — | Not reported |
| Gemini 2.5 Pro | ~87–90% [I] | Inferred |
| Grok 4 | — | Not reported |
| Grok 3 | ~85% [I] | Inferred |
| Llama 4 Maverick | ~85% [P] | Qwen3 paper base comparison (DeepSeek V3 comparable) |
| Llama 4 Scout | ~83% [P] | Qwen3 paper: 82.4 for Scout-comparable |
| DeepSeek V3 | 87.5% [P] | DeepSeek V3 paper (3-shot) |
| DeepSeek R1 | ~88–90% [P] | Inferred from MMLU/reasoning scores |
| Mistral Large 3 | — | Not officially reported |
| Qwen3 72B | ~88% [P] | Qwen3 tech report (post-trained comparable) |

### TruthfulQA (MC2)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | — | Not reported in recent model cards |
| GPT-4o (2024-11-20) | — | Not in 2024-11 system card |
| o3 | — | Not reported |
| o4-mini | — | Not reported |
| Claude models | — | Anthropic does not report TruthfulQA |
| Gemini 2.5 Pro | — | Not reported in Gemini 2.5 papers |
| Grok 4 | — | Not reported |
| Grok 3 | — | Not reported |
| Llama 4 Maverick | — | Not in Meta's benchmark set |
| Llama 4 Scout | — | Not reported |
| DeepSeek V3 | — | Not in V3 paper |
| DeepSeek R1 | — | Not in R1 paper |
| Mistral Large 3 | — | Not reported |
| Qwen3 72B | — | Not in Qwen3 report |

> **Note:** TruthfulQA has largely been dropped from frontier model benchmark suites as of 2024–2025. Most labs now use SimpleQA or FACTS Grounding instead.

### ARC-Challenge (25-shot)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | ~98–99% [I] | Near ceiling |
| GPT-4o (2024-11-20) | ~96% [P] | Various |
| o3 | ~97–98% [P] | Near ceiling |
| o4-mini | ~96–97% [P] | Near ceiling |
| Claude Opus 4.6 | — | Not reported |
| Claude Opus 4.5 | — | Not reported |
| Claude Opus 4 | — | Not reported |
| Claude Sonnet 4 | — | Not reported |
| Gemini 2.5 Pro | ~98% [I] | Near ceiling |
| Grok 4 | ~98% [I] | Near ceiling |
| Grok 3 | ~97% [I] | Estimated |
| Llama 4 Maverick | ~97% [I] | Estimated |
| Llama 4 Scout | ~96% [I] | Estimated |
| DeepSeek V3 | 95.3% [P] | DeepSeek V3 paper (25-shot) |
| DeepSeek R1 | ~96% [P] | Via comparisons |
| Mistral Large 3 | ~95–97% [I] | Estimated |
| Qwen3 72B | ~96–98% [I] | Estimated |

> **Note:** ARC-Challenge is near-saturation for frontier models (95–99%). It remains useful for comparing smaller/mid-tier models.

### HellaSwag (10-shot)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | ~95%+ [I] | Near ceiling |
| GPT-4o (2024-11-20) | ~95% [P] | Various sources |
| o3 | ~95% [P] | Near ceiling |
| o4-mini | ~94% [P] | Near ceiling |
| Claude Opus 4.6 | 97.2% [P] | anotherwrapper (thinking) |
| Claude Opus 4.5 | ~97% [P] | Inferred |
| Claude Opus 4 | — | Not reported |
| Claude Sonnet 4 | 97.2% [P] | anotherwrapper |
| Gemini 2.5 Pro | ~94–95% [I] | Near ceiling |
| Grok 4 | ~95% [I] | Estimated |
| Grok 3 | ~93–95% [I] | Estimated |
| Llama 4 Maverick | ~93% [I] | Estimated; Qwen3 paper: ~88.9% for DeepSeek V3 |
| Llama 4 Scout | ~91% [I] | Estimated |
| DeepSeek V3 | 88.9% [P] | DeepSeek V3 paper (10-shot) |
| DeepSeek R1 | ~90% [I] | Inferred |
| Mistral Large 3 | 93.6% [P] | shawnhack.com |
| Qwen3 72B | ~89–91% [I] | Estimated |

> **Note:** HellaSwag is saturated for frontier models. Scores cluster 88–97%.

### GAIA (Overall or by level)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | — | Not officially reported at launch |
| GPT-4o (2024-11-20) | — | Not reported |
| o3 | — | Not in o3 launch benchmarks |
| o4-mini | — | Not in o4-mini launch benchmarks |
| Claude Opus 4.6 | — | Not reported |
| Claude Opus 4.5 | — | Not reported |
| Claude Opus 4 | — | Not reported |
| Claude Sonnet 4 | — | Not reported |
| Gemini 2.5 Pro | — | Not in Gemini 2.5 report |
| Grok 4 | — | Not reported |
| Grok 3 | — | Not reported |
| All others | — | — |

> **Note:** GAIA requires tool use and web browsing; labs rarely report standard GAIA scores. It appears primarily on independent leaderboards (e.g., HuggingFace GAIA leaderboard).

### Chatbot Arena Elo (Overall)

| Model | Elo | Source / Date |
|-------|-----|---------------|
| GPT-5 ("GPT-5 Chat") | ~1426 [I] | BenchGecko Chatbot Arena, mid-2025 |
| GPT-4o (2024-11-20) | ~1340–1350 [I] | Various 2025 snapshots |
| o3 | ~1411 [I] | aileaderboards.com snapshot |
| o4-mini | ~1387–1395 [I] | Chatbot Arena |
| Claude Opus 4.6 | 1496–1503 [I] | BenchGecko, early 2026; #1–2 overall |
| Claude Opus 4.5 | ~1468 [I] | BenchGecko |
| Claude Opus 4 | ~1430–1450 [I] | Arena at launch |
| Claude Sonnet 4 | ~1400–1420 [I] | Arena approximate |
| Gemini 2.5 Pro | 1448 [I] | BenchGecko; was #1 in April 2025 |
| Grok 4 | ~1360–1375 [I] | Various estimates (Heavy variant higher) |
| Grok 3 | 1402 [I] | xAI official / deepranking.ai |
| Llama 4 Maverick | ~1417 [I] | Reported at launch (experimental chat) |
| Llama 4 Scout | ~1380–1390 [I] | Estimated |
| DeepSeek V3 | ~1358–1368 [I] | BenchGecko |
| DeepSeek R1 | ~1397–1422 [I] | BenchGecko (R1 / R1 0528) |
| Mistral Large 3 | ~1418 [I] | awesomeagents (launch) |
| Qwen3 72B | ~1395–1422 [I] | BenchGecko Qwen3 235B; 72B slightly lower |

### AIME 2024 (pass@1 unless noted)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | 93.3% [P] | DeepSeek V3.2 comparison table; "high" |
| GPT-4o (2024-11-20) | ~9–13% [P] | OpenAI comparison tables |
| o3 | 96.7% [P] | OpenAI blog / aibusinessweekly |
| o4-mini | 93.4% [P] | OpenAI blog (no tools) |
| Claude Opus 4.6 | ~95%+ [P] | Inferred from AIME 2025 99.79% |
| Claude Opus 4.5 | ~92% [P] | AIME 2025 92.77%; 2024 slightly higher |
| Claude Opus 4 | ~61–80% [P] | 61.3% (no thinking); 80.0% (multi-attempt, thinking) |
| Claude Sonnet 4 | ~61% [P] | Inferred from Sonnet 3.7 comparisons |
| Gemini 2.5 Pro | 92.0% [P] | Gemini 2.5 preview model card |
| Grok 4 | ~95–97% [P] | xAI; Heavy: ~100% on AIME |
| Grok 3 | 84.2% [P] | datalearner.ai (standard mode) |
| Llama 4 Maverick | ~39% [P] | llmbase.ai; Meta not official |
| Llama 4 Scout | ~28% [P] | llmbase.ai |
| DeepSeek V3 | 39.2% [P] | DeepSeek V3 paper |
| DeepSeek R1 | 79.8% [P] | DeepSeek R1 paper |
| Mistral Large 3 | 53.3% [P] | Atlas evaluation |
| Qwen3 72B | 74.3% [P] | Qwen3 tech report (thinking mode) |

### AIME 2025 (pass@1 unless noted)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | 94.6% [P] | No tools, "high" thinking; OpenAI dev page |
| GPT-4o (2024-11-20) | — | Not reported; est. ~5–10% |
| o3 | 88.9% [P] | OpenAI blog; no tools |
| o4-mini | 92.7% [P] | OpenAI blog; no tools |
| Claude Opus 4.6 | 99.79% [P] | Adaptive thinking, max effort; system card |
| Claude Opus 4.5 | 92.77% [P] | 64K thinking, no tools; system card (note: possible contamination flagged) |
| Claude Opus 4 | 75.5% [P] | Extended thinking; Gemini comparison table |
| Claude Sonnet 4 | 70.5% [P] | anotherwrapper; thinking mode |
| Gemini 2.5 Pro | 88.0% [P] | Single attempt; Gemini 2.5 report |
| Grok 4 | 91.7% [P] | Standard model; Heavy: 100%; xAI launch |
| Grok 3 | 93.3% [P] | cons@64, Think mode; xAI blog |
| Llama 4 Maverick | ~19% [P] | llmbase.ai |
| Llama 4 Scout | ~14% [P] | llmbase.ai |
| DeepSeek V3 | ~46–50% [P] | DeepSeek V3 paper baseline |
| DeepSeek R1 | 70.0% [P] | Qwen3 tech report comparison |
| Mistral Large 3 | 40.0% [P] | Atlas evaluation |
| Qwen3 72B | 79.2% [P] | Qwen3 tech report (thinking) |

### METR Time Horizon (Autonomous Task Duration)

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5 | — | Not officially reported at launch |
| GPT-4o (2024-11-20) | — | Not reported |
| o3 | — | Not reported in April 2025 launch materials |
| o4-mini | — | Not reported |
| Claude Opus 4.6 | — | Not reported in system card |
| Claude Opus 4.5 | — | Not reported |
| Claude Opus 4 | — | Not in May 2025 system card |
| Claude Sonnet 4 | — | Not reported |
| Gemini 2.5 Pro | — | Not reported |
| Grok 4 | — | Not reported |
| All others | — | — |

> **Note:** METR's "Autonomy" / "Time Horizon" evaluations are not yet publicly published for most frontier models as of early 2026. METR has evaluated some models privately for safety assessments, but public scores are not available.

---

## Pricing Reference (as of ~May 2026, per 1M tokens)

| Model | Input $/M | Output $/M | Context Window |
|-------|-----------|------------|----------------|
| GPT-5 | $1.25 | $10.00 | 128K–400K |
| GPT-5 Pro (thinking) | $2.50 | $15.00 | 400K |
| GPT-4o (2024-11-20) | $2.50 | $10.00 | 128K |
| o3 | $2.00 | $8.00 | 200K |
| o4-mini | $1.10 | $4.40 | 200K |
| Claude Opus 4.6 | $5.00 | $25.00 | 200K |
| Claude Opus 4.5 | $5.00 | $25.00 | 200K |
| Claude Opus 4 (legacy) | $15.00 | $75.00 | 200K |
| Claude Sonnet 4 | $3.00 | $15.00 | 200K |
| Gemini 2.5 Pro | $1.25 | $10.00 | 1M (2M beta) |
| Grok 4 | $3.00 | $15.00 | 256K |
| Grok 4 Fast | $0.20 | $0.50 | 256K |
| Grok 3 (retired/Mini) | ~$0.30 | ~$1.50 | 1M |
| Llama 4 Maverick | ~$0.35 | ~$0.85 | 1M |
| Llama 4 Scout | ~$0.17 | ~$0.66 | 10M |
| DeepSeek V3 | $0.27 | $1.10 | 128K |
| DeepSeek R1 | $0.55 | $2.19 | 128K |
| Mistral Large 3 | ~$0.95 | ~$4.00 | 256K |
| Qwen3 72B (Groq) | $0.29 | $0.59 | 128K |

---

## Model Type Summary

| Model | Type | Open/Closed | Architecture |
|-------|------|-------------|--------------|
| GPT-5 | Hybrid reasoning | Closed | Dense (est.) |
| GPT-4o (2024-11-20) | Standard | Closed | Dense (multimodal) |
| o3 | Reasoning (RL CoT) | Closed | Dense |
| o4-mini | Reasoning (RL CoT, efficient) | Closed | Dense |
| Claude Opus 4.6 | Hybrid reasoning | Closed | Dense |
| Claude Opus 4.5 | Hybrid reasoning | Closed | Dense |
| Claude Opus 4 | Hybrid reasoning | Closed | Dense |
| Claude Sonnet 4 | Hybrid reasoning | Closed | Dense |
| Gemini 2.5 Pro | Hybrid reasoning | Closed | MoE (sparse) |
| Grok 4 | Reasoning | Closed | Undisclosed |
| Grok 3 | Hybrid reasoning | Closed | Undisclosed |
| Llama 4 Maverick | Standard (multimodal) | Open (weights) | MoE (128 exp, 17B active) |
| Llama 4 Scout | Standard (multimodal) | Open (weights) | MoE (16 exp, 17B active) |
| DeepSeek V3 | Standard | Open (weights) | MoE (37B active / 671B) |
| DeepSeek R1 | Reasoning (RL CoT) | Open (weights) | MoE (37B active / 671B) |
| Mistral Large 3 | Standard | Open (Apache 2.0) | MoE (41B active / 675B) |
| Qwen3 72B | Hybrid reasoning | Open (Apache 2.0) | Dense (72B) |

---

## Key Benchmark Notes & Caveats

1. **Benchmark saturation:** MMLU, HellaSwag, ARC-Challenge, and GSM8K are near-saturated for frontier models (scores cluster 88–99%). Differences are too small to be meaningful for top-tier model comparisons.

2. **Evaluation setup matters enormously:**  
   - SWE-bench scores vary significantly by scaffold (simple bash vs. proprietary agent frameworks). Anthropic, OpenAI, and Google use different scaffolds, so scores are **not directly comparable** across labs.  
   - AIME scores depend on whether tools (Python interpreter) are enabled, consensus@N vs pass@1, and potential contamination of the 2025 paper.

3. **Provider self-reporting bias:** Nearly all benchmark scores here are self-reported [P] by the model's developer. Independent third-party replication is rare and often shows lower numbers. Treat especially high scores with skepticism.

4. **Claude Opus 4.5 AIME 2025 contamination flag:** Anthropic itself flagged possible contamination for the 92.77% score in the system card. Treat this score cautiously.

5. **Grok 4 Heavy vs. standard:** Many impressive Grok 4 scores (AIME 100%, HLE >50%) come from the "Heavy" multi-agent variant, which uses significantly more compute than a standard single-model call.

6. **TruthfulQA & GAIA:** These benchmarks have been largely abandoned by frontier labs. TruthfulQA is replaced by SimpleQA/FACTS; GAIA requires web+tools and appears mostly on HuggingFace's public leaderboard.

7. **Model families:** "Claude Opus 4" refers specifically to the May 2025 release. Subsequent updates (Opus 4.1, 4.5, 4.6) are separate models with substantially higher scores. Anthropic's versioning does not follow a simple linear progression.

8. **Gemini 3 (not Gemini 2.5 Pro):** At the time of this compilation, "Gemini 3 Pro" appears in Arena leaderboard data and some aggregators, but no official Google announcement or benchmark card has been published. The primary confirmed model is **Gemini 2.5 Pro**. Scores attributed to "Gemini 3 Pro" in third-party sources should be treated as unverified.

9. **DeepSeek V3 vs R1:** The original DeepSeek V3 (Dec 2024) and R1 (Jan 2025) are the models covered here. DeepSeek has since released V3.2, which substantially improves scores (AIME 2025: 96.0%, SWE-bench: 77.2%).

---

## Sources

| Source | Type |
|--------|------|
| OpenAI developer benchmark page (openai.com/index/introducing-gpt-5-for-developers) | Official [P] |
| Anthropic system cards (claude-opus-4-5-system-card, claude-opus-4-6-system-card) | Official [P] |
| Gemini 2.5 report (arxiv.org/html/2507.06261v2) | Official [P] |
| Gemini 2.5 Pro Model Card PDF | Official [P] |
| DeepSeek R1 paper (arxiv.org/pdf/2501.12948v1) | Official [P] |
| DeepSeek V3.2 paper (arxiv.org/pdf/2512.02556) | Official [P] |
| xAI Grok 3 announcement (x.ai/news/grok-3) | Official [P] |
| Anthropic Claude 4 launch blog (anthropic.com/news/claude-4) | Official [P] |
| Qwen3 Technical Report (arxiv.org/html/2505.09388v1) | Official [P] |
| Meta Llama 4 model page (llama.meta.com/models/llama-4) | Official [P] |
| Mistral Large 3 docs + Azure eval | Official [P] |
| BenchGecko Chatbot Arena (benchgecko.ai) | Independent [I] |
| aileaderboards.com | Independent [I] |
| Artificial Analysis (artificialanalysis.ai) | Independent [I] |
| llm-stats.com | Independent [I] |
| SWE-bench leaderboard (swebench.com) | Independent [I] |
