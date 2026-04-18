import Link from "next/link";
import { Suspense } from "react";
import { FeedTimeline } from "@/components/feed/FeedTimeline";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { Badge } from "@/components/ui/Badge";
import { QuickAccessCard } from "@/components/brand/QuickAccessCard";
import { LogoPermaBrella } from "@/components/brand/Logo";

const panels = [
  {
    href: "/events",
    title: "Events & workshops",
    blurb: "Skill shares, working bees, and food security gatherings.",
    tag: "Gather",
    icon: "/brand/icon-events.svg",
    iconAlt: "",
  },
  {
    href: "/offerings",
    title: "Offerings & wants",
    blurb: "Share surplus, tools, seeds, and what you are looking for.",
    tag: "Share",
    icon: "/brand/icon-offerings.svg",
    iconAlt: "",
  },
  {
    href: "/land-connect",
    title: "Land connect",
    blurb: "Match landholders with growers who want to cultivate.",
    tag: "Connect",
    icon: "/brand/icon-land.svg",
    iconAlt: "",
  },
  {
    href: "/directory",
    title: "Community groups",
    blurb: "Find local organisations already on the ground.",
    tag: "Groups",
    icon: "/brand/icon-groups.svg",
    iconAlt: "",
  },
  {
    href: "/community",
    title: "Community Q&A",
    blurb: "Ask and answer practical growing questions by topic.",
    tag: "Learn",
    icon: "/brand/icon-qa.svg",
    iconAlt: "",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="grid overflow-hidden rounded-[var(--pb-r-lg)] border border-[var(--pb-line)] bg-[var(--pb-surface)] shadow-[var(--pb-shadow-card)] md:grid-cols-[1.3fr_1fr]">
        <div className="p-8 sm:p-10 md:p-14">
          <Badge className="border-[var(--pb-line)] bg-[var(--pb-bg)] text-[var(--pb-primary)]">
            Northern Rivers, NSW
          </Badge>
          <h1 className="pb-display mt-5 max-w-3xl text-3xl leading-[1.08] tracking-tight text-[var(--pb-ink)] sm:text-4xl md:text-[2.75rem]">
            PermaBrella — food security switchboard
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--pb-ink-soft)] sm:text-[17px]">
            Connect growers with land, surface local events and offerings, and share
            knowledge so our communities stay fed and resilient.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-primary)] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[var(--pb-primary-dk)]"
            >
              Post to the switchboard
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center justify-center rounded-[var(--pb-r-sm)] border border-[var(--pb-line)] bg-transparent px-5 py-3 text-[15px] font-semibold text-[var(--pb-ink)] transition hover:bg-[var(--pb-bg)]"
            >
              Browse Q&amp;A
            </Link>
          </div>
        </div>
        <div className="relative hidden min-h-[260px] bg-[var(--pb-bg-alt)] md:block">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: "url('/brand/pattern-seed-scatter.svg')",
              backgroundSize: "120px 120px",
            }}
            aria-hidden
          />
          <div className="relative flex h-full min-h-[260px] items-center justify-center p-8">
            <LogoPermaBrella size={96} />
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--pb-ink)]">Region</h2>
          <p className="text-sm text-[var(--pb-muted)]">
            Narrow what you see to your area (more filters coming soon).
          </p>
        </div>
        <div className="w-full max-w-xs">
          <Suspense fallback={<div className="h-10 rounded-[var(--pb-r-md)] bg-[var(--pb-surface)] ring-1 ring-[var(--pb-line)]" />}>
            <RegionFilter id="home-region" />
          </Suspense>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="panels-heading">
        <h2
          id="panels-heading"
          className="text-lg font-bold tracking-tight text-[var(--pb-ink)]"
        >
          Quick access
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {panels.map((p) => (
            <QuickAccessCard
              key={p.href}
              href={p.href}
              iconSrc={p.icon}
              iconAlt=""
              tag={p.tag}
              title={p.title}
              description={p.blurb}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-bold tracking-tight text-[var(--pb-ink)]">
          Recent activity
        </h2>
        <div className="mt-4">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-[var(--pb-r-md)] bg-[var(--pb-surface)] ring-1 ring-[var(--pb-line)]" />}>
            <FeedTimeline />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
