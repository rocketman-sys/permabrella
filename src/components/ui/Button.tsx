import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--perm-primary)] text-white hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[var(--perm-secondary)]",
  secondary:
    "bg-[var(--perm-earth)] text-white hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[var(--perm-secondary)]",
  ghost:
    "bg-transparent text-[var(--perm-primary)] hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-[var(--perm-border)]",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--pb-r-sm)] px-4 py-2 text-sm font-semibold transition disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
