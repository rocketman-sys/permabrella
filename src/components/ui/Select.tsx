import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-lg border border-[var(--perm-border)] bg-white px-3 py-2.5 text-base text-[var(--perm-text)] focus:border-[var(--perm-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--perm-secondary)]/30 md:min-h-10 md:py-2 md:text-sm",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
