import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  className?: string;
  maxHeight?: string;
}

export function CodeBlock({ code, className, maxHeight = "400px" }: CodeBlockProps) {
  return (
    <div
      className={cn("rounded-lg border border-zinc-800 overflow-auto", className)}
      style={{ maxHeight }}
    >
      <pre className="p-4 text-sm text-zinc-300 font-mono leading-relaxed m-0 border-0 rounded-none">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
      {children}
    </code>
  );
}
