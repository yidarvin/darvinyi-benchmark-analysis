import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { NewBadge } from "@/components/ui/NewBadge";
import { cn } from "@/lib/utils";
import type { AgentSystem } from "@/lib/types";
import { MODEL_MAP } from "@/data/models";

interface AgentCardProps {
  agent: AgentSystem;
  isNew?: boolean;
}

export function AgentCard({ agent, isNew = false }: AgentCardProps) {
  const topResult = agent.results
    .slice()
    .sort((a, b) => b.score - a.score)[0];
  const topModel = topResult ? MODEL_MAP[topResult.modelId] : null;

  return (
    <Link href={`/agents/${agent.slug}`} className="block group">
      <div
        className={cn(
          "h-full rounded-xl border bg-zinc-900 p-5 transition-colors",
          "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge color="#71717a" size="sm">
              {agent.institution}
            </Badge>
            {isNew && <NewBadge />}
          </div>
          <span className="text-xs text-zinc-600 shrink-0">{agent.year}</span>
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold text-zinc-50 mb-1.5 group-hover:text-white transition-colors">
          {agent.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-4">
          {agent.shortDescription}
        </p>

        {/* What makes it unique — first bullet */}
        {agent.whatMakesItUnique?.[0] && (
          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-1 mb-4 italic">
            {agent.whatMakesItUnique[0]}
          </p>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-600">
            {agent.stats.totalTasks} tasks
          </span>
          {topResult && topModel && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: topModel.color }}
              />
              <span className="text-xs font-mono font-medium text-zinc-300">
                {topResult.scoreLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
