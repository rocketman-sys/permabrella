"use client";

import { useRef } from "react";
import Link from "next/link";
import { ActiveNavLinks } from "./ActiveNavLinks";
import type { ReactNode } from "react";

export function MobileMenu({ links, account }: {
  links: { href: string; label: string }[];
  account: ReactNode;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <details ref={menu} className="group lg:hidden" onKeyDown={(event) => {
      if (event.key === "Escape" && menu.current) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    }}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-[var(--pb-line)] px-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        Menu
      </summary>
      <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-6rem)] overflow-y-auto border-b border-[var(--pb-line)] bg-[var(--pb-surface)] p-4 shadow-lg" onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("a,button") && menu.current) menu.current.open = false;
      }}>
        <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2 [&_a]:rounded-md [&_a]:p-3"><ActiveNavLinks links={links} /></nav>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[var(--pb-line)] pt-3"><Link href="/submit" className="rounded-md bg-[var(--pb-primary)] px-4 py-3 text-sm font-semibold text-white">Post a listing</Link>{account}</div>
        <Link href="/how-it-works" className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--pb-accent-2)] underline">How it works</Link>
      </div>
    </details>
  );
}
