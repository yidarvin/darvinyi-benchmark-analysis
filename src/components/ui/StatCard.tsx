import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  className?: string;
}

export function StatCard({ label, value, sub, color, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-zinc-800 bg-zinc-900 p-4", className)}>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p
        className="text-2xl font-bold tabular-nums"
        style={{ color: color || "#fafafa" }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}
