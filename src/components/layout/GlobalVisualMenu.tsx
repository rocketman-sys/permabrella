"use client";

import { usePathname } from "next/navigation";
import { HeroHubArt, type HeroHubItem } from "@/components/brand/HeroHubArt";

const items: HeroHubItem[] = [
  {
    href: "/events",
    title: "Events & workshops",
    tag: "Events",
    icon: "/brand/icon-events.svg",
  },
  {
    href: "/offerings",
    title: "Offerings, Wants & Exchange",
    tag: "Exchange",
    icon: "/brand/icon-offerings.svg",
  },
  {
    href: "/land-connect",
    title: "Land connect",
    tag: "Land Connect",
    icon: "/brand/icon-land.svg",
  },
  {
    href: "/directory",
    title: "Community groups",
    tag: "Groups",
    icon: "/brand/icon-groups.svg",
  },
  {
    href: "/grants",
    title: "Community grants",
    tag: "Grants",
    icon: "/brand/icon-grants.svg",
  },
  {
    href: "/community",
    title: "Community Q&A",
    tag: "Discuss",
    icon: "/brand/icon-qa.svg",
  },
];

function activeHrefForPath(pathname: string): string | undefined {
  const match = items.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`)
  );
  return match?.href;
}

export function GlobalVisualMenu() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const activeHref = activeHrefForPath(pathname);

  return (
    <aside
      className="pointer-events-auto hidden md:block"
      aria-label="Visual section menu"
    >
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-[var(--pb-muted)]">
        Visual menu - click an icon to navigate
      </p>
      <HeroHubArt
        items={items}
        logoSize={50}
        activeHref={activeHref}
        centerHref="/"
        className="!w-[194px] !max-w-none"
      />
    </aside>
  );
}
