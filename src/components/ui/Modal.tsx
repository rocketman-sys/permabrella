"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-[var(--perm-border)] bg-[var(--perm-card)] p-5 shadow-lg",
          className
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title ? (
          <h2 id="modal-title" className="mb-3 text-lg font-semibold text-[var(--perm-primary)]">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}

