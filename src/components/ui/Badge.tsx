import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ children, color = "#71717a", className, size = "sm" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{
        backgroundColor: color + "22",
        borderColor: color + "55",
        color: color,
      }}
    >
      {children}
    </span>
  );
}

export function VendorBadge({ title = "Score reported by the model's creator, not independently verified" }: { title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold cursor-help"
      style={{ backgroundColor: "#f59e0b22", color: "#f59e0b", border: "1px solid #f59e0b55" }}
    >
      V
    </span>
  );
}
