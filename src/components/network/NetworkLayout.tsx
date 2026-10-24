import Link from "next/link";
import type { ReactNode } from "react";

export const networkButton = "inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--pb-accent-2)] px-5 py-3 text-center font-semibold text-white hover:bg-[var(--pb-ink)]";
export const networkLink = "inline-flex min-h-11 items-center font-semibold text-[var(--pb-accent-2)] underline underline-offset-4";
export const networkCard = "rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-5 sm:p-7";

export function ComingSoon() {
  return <span className="inline-flex rounded-full border border-[var(--pb-line)] bg-[var(--pb-bg)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--pb-accent-2)]">Coming soon</span>;
}

export function NetworkLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 md:py-10"><nav aria-label="PermaBrella network" className="mb-6 flex flex-wrap gap-x-5 gap-y-1 text-sm"><Link href="/equipment" className={networkLink}>Shared equipment</Link><Link href="/join" className={networkLink}>Membership interest</Link><Link href="/contact" className={networkLink}>Contact the team</Link><Link href="/about" className={networkLink}>Our partners</Link></nav>{children}</div>;
}
