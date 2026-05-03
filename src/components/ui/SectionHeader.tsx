import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, description, className, action }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-10", className)}>
      <h1 className="text-3xl font-bold text-zinc-50 mb-2">{title}</h1>
      {description && <p className="text-base text-zinc-400 max-w-2xl">{description}</p>}
      {children}
    </div>
  );
}
