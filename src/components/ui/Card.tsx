import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--pb-r-md)] border border-[var(--perm-border)] bg-[var(--perm-card)] p-5 shadow-[var(--pb-shadow-card)]",
        className
      )}
      {...props}
    />
  );
}
