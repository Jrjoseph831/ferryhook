import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
            "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700": variant === "secondary",
            "text-slate-400 hover:text-slate-200 hover:bg-slate-800": variant === "ghost",
            "bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-500/20": variant === "danger",
          },
          {
            "h-8 px-3 text-xs gap-1.5": size === "sm",
            "h-9 px-4 text-sm gap-2": size === "md",
            "h-10 px-6 text-sm gap-2": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
