import { cn } from "@/lib/utils";

type BadgeVariant = "delivered" | "retrying" | "failed" | "filtered" | "received" | "processing" | "default";

const variants: Record<BadgeVariant, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  retrying: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  filtered: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  received: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant = (variants[status as BadgeVariant] ? status : "default") as BadgeVariant;
  return <Badge variant={variant}>{status}</Badge>;
}
