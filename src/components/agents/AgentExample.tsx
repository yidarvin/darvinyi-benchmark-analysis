import { Badge } from "@/components/ui/Badge";
import type { AgentExample as AgentExampleType } from "@/lib/types";

interface AgentExampleProps {
  example: AgentExampleType;
  index: number;
}

export function AgentExample({ example, index }: AgentExampleProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-600">#{index + 1}</span>
          <h4 className="text-sm font-medium text-zinc-200">{example.title}</h4>
        </div>
        <div className="flex items-center gap-1.5">
          {example.economicValue && (
            <Badge color="#10b981" size="sm">
              {example.economicValue}
            </Badge>
          )}
          {example.humanTime && (
            <Badge color="#71717a" size="sm">
              {example.humanTime}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Job type */}
        {example.jobType && (
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {example.jobType}
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-zinc-300 leading-relaxed">{example.description}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {/* Input */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              What the Agent Receives
            </p>
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-400 leading-relaxed">
              {example.input}
            </div>
          </div>

          {/* Output */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
              What It Must Produce
            </p>
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-400 leading-relaxed">
              {example.output}
            </div>
          </div>
        </div>

        {/* Evaluation */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
            How Success Is Judged
          </p>
          <div className="rounded-lg bg-zinc-950 border border-green-900/30 p-3 text-xs text-zinc-400 leading-relaxed">
            {example.evaluation}
          </div>
        </div>
      </div>
    </div>
  );
}
