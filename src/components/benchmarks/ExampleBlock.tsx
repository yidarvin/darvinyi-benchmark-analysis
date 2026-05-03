"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { cn } from "@/lib/utils";
import type { BenchmarkExample } from "@/lib/types";

interface ExampleBlockProps {
  example: BenchmarkExample;
  index: number;
}

function isCode(text: string): boolean {
  return (
    text.includes("def ") ||
    text.includes("```") ||
    text.includes("from ") ||
    text.includes("import ") ||
    text.includes("SELECT ") ||
    text.includes("find ") ||
    (text.split("\n").length > 3 && text.includes("    "))
  );
}

export function ExampleBlock({ example, index }: ExampleBlockProps) {
  const [showSolution, setShowSolution] = useState(false);

  const difficultyColor =
    example.difficulty?.toLowerCase().includes("hard") ||
    example.difficulty?.toLowerCase().includes("level 5") ||
    example.difficulty?.toLowerCase().includes("level 4")
      ? "#ef4444"
      : example.difficulty?.toLowerCase().includes("medium") ||
          example.difficulty?.toLowerCase().includes("level 3")
        ? "#f59e0b"
        : "#10b981";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-600">#{index + 1}</span>
          <h4 className="text-sm font-medium text-zinc-200">{example.title}</h4>
        </div>
        {example.difficulty && (
          <Badge color={difficultyColor} size="sm">
            {example.difficulty}
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Input */}
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Problem / Input
          </p>
          {isCode(example.input) ? (
            <CodeBlock code={example.input} />
          ) : (
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono">
              {example.input}
            </div>
          )}
        </div>

        {/* Solution (collapsible) */}
        {example.solution && (
          <div>
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span
                className={cn(
                  "transition-transform",
                  showSolution ? "rotate-90" : ""
                )}
              >
                ▶
              </span>
              {showSolution ? "Hide" : "Show"} Solution
            </button>
            {showSolution && (
              <div className="mt-2">
                {isCode(example.solution) ? (
                  <CodeBlock code={example.solution} />
                ) : (
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {example.solution}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Answer */}
        <div className="flex items-start gap-3 rounded-lg bg-zinc-950 border border-zinc-700/50 p-3">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider shrink-0 mt-0.5">
            Answer
          </span>
          <span className="text-sm font-mono font-medium text-green-400">
            {example.answer}
          </span>
        </div>

        {/* Notes */}
        {example.notes && (
          <p className="text-xs text-zinc-500 leading-relaxed italic">
            {example.notes}
          </p>
        )}
      </div>
    </div>
  );
}
