import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ALL_AGENTS, AGENT_MAP } from "@/data";
import { MODEL_MAP } from "@/data/models";
import { Badge } from "@/components/ui/Badge";
import { VendorBadge } from "@/components/ui/Badge";
import { AgentExample } from "@/components/agents/AgentExample";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_AGENTS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = AGENT_MAP[slug];
  if (!agent) return {};
  return { title: agent.name, description: agent.shortDescription };
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const agent = AGENT_MAP[slug];
  if (!agent) notFound();

  const sortedResults = [...agent.results].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-cyan-400 mb-6 transition-colors"
      >
        ← Back to Agent Evaluations
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge color="#71717a">{agent.institution}</Badge>
          <Badge color="#06b6d4">{agent.year}</Badge>
        </div>
        <h1 className="text-3xl font-bold text-zinc-50 mb-2">{agent.name}</h1>
        <p className="text-base text-zinc-400">{agent.shortDescription}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-zinc-800">
          <div>
            <span className="text-xs text-zinc-600 block">Tasks</span>
            <span className="text-sm font-mono font-semibold text-zinc-200">
              {agent.stats.totalTasks}
            </span>
          </div>
          {agent.stats.publicTasks && (
            <div>
              <span className="text-xs text-zinc-600 block">Public</span>
              <span className="text-sm font-mono font-semibold text-zinc-200">
                {agent.stats.publicTasks}
              </span>
            </div>
          )}
          <div>
            <span className="text-xs text-zinc-600 block">Primary Metric</span>
            <span className="text-sm font-semibold text-zinc-200">
              {agent.stats.primaryMetric}
            </span>
          </div>
          {agent.stats.avgHumanTime && (
            <div>
              <span className="text-xs text-zinc-600 block">Avg Human Time</span>
              <span className="text-sm font-semibold text-amber-400">
                {agent.stats.avgHumanTime}
              </span>
            </div>
          )}
          {agent.stats.totalEconomicValue && (
            <div>
              <span className="text-xs text-zinc-600 block">Economic Value</span>
              <span className="text-sm font-semibold text-green-400">
                {agent.stats.totalEconomicValue}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <section className="mb-10">
        <SectionHeader title="Overview" />
        <div className="space-y-3">
          {agent.description.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-zinc-400 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Task Anatomy */}
      <section className="mb-10">
        <SectionHeader title="How It Works" description="Task setup, inputs, outputs, and evaluation." />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          {[
            { label: "Setup", value: agent.taskAnatomy.setup },
            { label: "Input", value: agent.taskAnatomy.input },
            { label: "Output", value: agent.taskAnatomy.output },
            { label: "Evaluation", value: agent.taskAnatomy.evaluation },
            { label: "Metric", value: agent.taskAnatomy.metric },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex gap-4 px-5 py-4 border-b border-zinc-800 last:border-0"
            >
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider w-20 shrink-0 mt-0.5">
                {label}
              </span>
              <span className="text-sm text-zinc-300 leading-relaxed">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      {agent.examples.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="Example Tasks"
            description="Real tasks from this evaluation system."
          />
          <div className="space-y-4">
            {agent.examples.map((example, i) => (
              <AgentExample key={i} example={example} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {sortedResults.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="Results" description="Model performance on this evaluation." />
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Model</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 hidden sm:table-cell">Domain</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result, i) => {
                  const model = MODEL_MAP[result.modelId];
                  return (
                    <tr
                      key={i}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-zinc-600 font-mono">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {model && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: model.color }}
                            />
                          )}
                          <span className="text-sm font-medium text-zinc-200">
                            {model?.shortName || result.modelId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {result.isVendorReported && <VendorBadge />}
                          <span className="font-mono font-semibold text-zinc-100 text-sm">
                            {result.scoreLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500 hidden sm:table-cell">
                        {result.domain || result.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 font-mono hidden md:table-cell">
                        {result.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Key Findings */}
      {agent.keyFindings && agent.keyFindings.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="Key Findings" />
          <ul className="space-y-3">
            {agent.keyFindings.map((finding, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-cyan-400" />
                <p className="text-sm text-zinc-400 leading-relaxed">{finding}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* What makes it unique */}
      {agent.whatMakesItUnique && agent.whatMakesItUnique.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="What Makes It Unique" />
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <ul className="space-y-3">
              {agent.whatMakesItUnique.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 text-green-400 text-sm shrink-0">✓</span>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Controversies */}
      {agent.controversies && agent.controversies.length > 0 && (
        <section className="mb-10">
          <SectionHeader title="Controversies & Caveats" />
          <div className="space-y-2">
            {agent.controversies.map((c, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
              >
                <span className="text-amber-500 mt-0.5 shrink-0 text-sm">⚠</span>
                <p className="text-sm text-zinc-400 leading-relaxed">{c}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Links */}
      <section className="mb-10">
        <SectionHeader title="Links" />
        <div className="flex flex-wrap gap-2">
          {agent.links.arxiv && (
            <a href={agent.links.arxiv} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
              arXiv Paper ↗
            </a>
          )}
          {agent.links.leaderboard && (
            <a href={agent.links.leaderboard} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
              Leaderboard ↗
            </a>
          )}
          {agent.links.dataset && (
            <a href={agent.links.dataset} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
              Dataset ↗
            </a>
          )}
          {agent.links.github && (
            <a href={agent.links.github} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
              GitHub ↗
            </a>
          )}
          {agent.links.website && (
            <a href={agent.links.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
              Website ↗
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
