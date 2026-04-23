"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ActiveNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((l) => {
        const active = isActive(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              active
                ? "font-bold text-[var(--pb-primary)] underline decoration-[var(--pb-primary)] underline-offset-4"
                : "text-[var(--pb-ink-soft)] transition hover:text-[var(--pb-primary)]"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
