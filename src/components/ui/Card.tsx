import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: string;
}

export function Card({ children, className, hover = false, accent }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-zinc-900 border-zinc-800 p-5",
        hover && "transition-colors hover:border-zinc-700 hover:bg-zinc-800/50 cursor-pointer",
        className
      )}
      style={accent ? { borderLeftColor: accent, borderLeftWidth: "3px" } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-zinc-50", className)}>{children}</h3>;
}
