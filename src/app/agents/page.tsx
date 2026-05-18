import { ALL_AGENTS } from "@/data";
import { AgentCard } from "@/components/agents/AgentCard";
import { CrawlUpdateButton } from "@/components/CrawlUpdateButton";

export default function AgentsPage() {
  return (
    <div>
      <div className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50 mb-2">Agent Evaluations</h1>
          <p className="text-base text-zinc-400 max-w-2xl">
            Benchmarks that test AI on real human work — not synthetic tasks. How much economic value can AI agents actually deliver?
          </p>
        </div>
        <CrawlUpdateButton
          apiBase="/api/agent-crawl"
          labels={{
            idle: "Check for new agent evals",
            running: "Searching for new agent evals…",
            noun: "agent eval",
            nounPlural: "agent evals",
          }}
        />
      </div>

      {/* What are real-work benchmarks */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 mb-10">
        <h2 className="text-base font-semibold text-zinc-100 mb-2">
          Why real-work benchmarks are different
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Standard benchmarks test isolated capabilities — a math problem, a code snippet, a multiple-choice question.
          Real-work benchmarks test complete, end-to-end tasks: drafting a legal memo, completing a freelance animation project,
          or analyzing patient records and producing a care plan. The gap between the two is enormous.
          Models scoring 80%+ on SWE-bench Verified complete fewer than 4% of real Upwork projects to client-acceptable quality.
        </p>
      </div>

      {/* All evaluations */}
      <section>
        <h2 className="text-lg font-bold text-zinc-50 mb-5">All Evaluations</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_AGENTS.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      </section>
    </div>
  );
}
