import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-800 bg-slate-900 p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn("text-sm font-medium text-slate-300", className)}>
      {children}
    </h3>
  );
}

export function CardValue({ children, className }: CardProps) {
  return (
    <div className={cn("text-2xl font-semibold text-slate-100", className)}>
      {children}
    </div>
  );
}
