"use client";

import { useFormStatus } from "react-dom";

export function SearchSubmit({ label = "Search" }: { label?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending}
    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--pb-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--pb-primary-dk)] disabled:opacity-70">
    {pending ? "Searching…" : label}
  </button>;
}
