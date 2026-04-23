import Link from "next/link";
import { Suspense } from "react";
import { FeedTimeline } from "@/components/feed/FeedTimeline";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { Badge } from "@/components/ui/Badge";
import { QuickAccessCard } from "@/components/brand/QuickAccessCard";
import { HeroHubArt } from "@/components/brand/HeroHubArt";
import { HeroStats } from "@/components/brand/HeroStats";
import { GlobalSearchForm } from "@/components/search/GlobalSearchForm";
import { listTopicsOrdered } from "@/lib/community/service";
import { getHeroStats } from "@/lib/posts/service";

/** Order matches navbar and hero hub satellites clockwise from the top. */
const panels = [
  {
    href: "/events",
    title: "Events & workshops",
    blurb: "Skill shares, working bees, and food security gatherings.",
    tag: "Events",
    icon: "/brand/icon-events.svg",
    iconAlt: "",
  },
  {
    href: "/offerings",
    title: "Offerings, Wants & Exchange",
    blurb: "Share surplus, tools, seeds, and what you are looking for.",
    tag: "Exchange",
    icon: "/brand/icon-offerings.svg",
    iconAlt: "",
  },
  {
    href: "/land-connect",
    title: "Land connect",
    blurb: "Match landholders with growers who want to cultivate.",
    tag: "Land Connect",
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
    href: "/grants",
    title: "Community grants",
    blurb: "Funding rounds, programs, and in-kind offerings for local resilience.",
    tag: "Grants",
    icon: "/brand/icon-grants.svg",
    iconAlt: "",
  },
  {
    href: "/community",
    title: "Community Q&A",
    blurb: "Ask and answer practical growing questions by topic.",
    tag: "Discuss",
    icon: "/brand/icon-qa.svg",
    iconAlt: "",
  },
];

const hubItems = panels.map((p) => ({
  href: p.href,
  icon: p.icon,
  title: p.title,
  tag: p.tag,
}));

export default async function Home() {
  const [heroStats, topicRows] = await Promise.all([
    getHeroStats(),
    listTopicsOrdered(),
  ]);
  const topicOptions = topicRows.map((t) => ({ slug: t.slug, name: t.name }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 md:py-10">
      <section className="relative grid overflow-visible rounded-[var(--pb-r-lg)] border border-[var(--pb-line)] shadow-[var(--pb-shadow-card)] md:grid-cols-[1.3fr_1fr]">
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
          style={{
            backgroundImage: `linear-gradient(
              165deg,
              color-mix(in srgb, var(--pb-surface) 90%, transparent) 0%,
              color-mix(in srgb, var(--pb-surface) 86%, transparent) 45%,
              color-mix(in srgb, var(--pb-bg-alt) 82%, transparent) 100%
            ), var(--pb-hero-bg-tile)`,
            backgroundSize: "100% 100%, 160px 160px",
            backgroundRepeat: "no-repeat, repeat",
          }}
          aria-hidden
        />
        <div className="relative z-10 p-6 sm:p-10 md:p-14">
          <Badge className="border-[var(--pb-line)] bg-[var(--pb-bg)] text-[var(--pb-primary)]">
            Northern Rivers, NSW
          </Badge>
          <h1 className="pb-display mt-5 max-w-3xl text-[2.125rem] leading-[1.08] tracking-tight text-[var(--pb-ink)] sm:text-4xl md:text-[2.75rem]">
            PermaBrella — Northern Rivers permaculture hub
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--pb-ink-soft)] md:text-[17px]">
            An umbrella platform connecting all things permaculture, food security,
            and community resilience in our local region.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-2">
            <Link
              href="/submit"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-primary)] px-5 py-3 text-base font-semibold text-white transition hover:bg-[var(--pb-primary-dk)]"
            >
              Post to the switchboard
            </Link>
            <Link
              href="/submit"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--pb-r-sm)] border border-[var(--pb-line)] bg-transparent px-5 py-3 text-base font-semibold text-[var(--pb-ink)] transition hover:bg-[var(--pb-bg)]"
            >
              How it works
            </Link>
          </div>
          <HeroStats
            activeGrowers={heroStats.activeGrowers}
            activeThreads={heroStats.activeThreads}
            events={heroStats.events}
          />
          <div className="mt-6 max-w-2xl rounded-[var(--pb-r-md)] border border-[var(--pb-line)] bg-[color-mix(in_srgb,var(--pb-bg-alt)_35%,var(--pb-surface))] px-4 py-3.5 shadow-[var(--pb-shadow-card)] sm:px-5 sm:py-4">
            <p className="text-base italic leading-relaxed text-[var(--pb-ink-soft)] md:text-sm">
              This is a new site and needs to be populated. If you know of any
              organisations that should be on here, please add to the{" "}
              <Link
                href="/directory"
                className="font-semibold not-italic text-[var(--pb-primary)] underline decoration-[var(--pb-primary)]/35 underline-offset-2 transition hover:text-[var(--pb-primary-dk)] hover:decoration-[var(--pb-primary-dk)]/50"
              >
                community groups page
              </Link>
              .
            </p>
          </div>
          <div className="relative mt-8 border-t border-[var(--pb-line)] pt-8 md:hidden">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: "url('/brand/pattern-seed-scatter.svg')",
                backgroundSize: "120px 120px",
              }}
              aria-hidden
            />
            <div className="relative flex justify-center">
              <HeroHubArt logoSize={68} items={hubItems} />
            </div>
          </div>
        </div>
        <div className="relative z-10 hidden min-h-[260px] md:block">
          <div className="relative flex h-full min-h-[280px] items-center justify-center p-6 sm:p-8">
            <HeroHubArt logoSize={84} items={hubItems} />
          </div>
        </div>
      </section>

      <section className="mt-5" aria-label="System search">
        <GlobalSearchForm topics={topicOptions} />
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--pb-ink)] md:text-sm">
            Region
          </h2>
          <p className="mt-0.5 text-base text-[var(--pb-muted)] md:text-sm">
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
          className="text-xl font-bold tracking-tight text-[var(--pb-ink)] md:text-lg"
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
        <h2 className="text-xl font-bold tracking-tight text-[var(--pb-ink)] md:text-lg">
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
