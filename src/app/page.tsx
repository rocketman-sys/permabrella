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
import { getHeroStats, listNewsPostsSafe } from "@/lib/posts/service";

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

type HomeNewsItem = { key: string; title: string; body: string; href?: string };

function excerptText(text: string, max = 200): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

const NEWS_SECTION_FALLBACK: Omit<HomeNewsItem, "key">[] = [
  {
    title: "How it works page is now live",
    body: "Read the project vision and how PermaBrella functions as an evolving networking node in the regional communal fabric.",
    href: "/how-it-works",
  },
  {
    title: "Exchange and land connect listings are active",
    body: "You can now post offerings/wants and land opportunities directly through the switchboard.",
    href: "/submit",
  },
  {
    title: "Global search now spans listings and community threads",
    body: "Search events, exchange, land connect, groups, grants, news, and practical Q&A from one place.",
    href: "/search",
  },
];

export default async function Home() {
  const [heroStats, topicRows, newsRows] = await Promise.all([
    getHeroStats(),
    listTopicsOrdered(),
    listNewsPostsSafe({ limit: 12 }),
  ]);
  const topicOptions = topicRows.map((t) => ({ slug: t.slug, name: t.name }));

  const fromDb: HomeNewsItem[] = newsRows.map(({ post }) => ({
    key: post.id,
    title: post.title,
    body: excerptText(post.description),
    href: `/news/${post.id}`,
  }));
  const fallbackWithKeys: HomeNewsItem[] = NEWS_SECTION_FALLBACK.map((item, i) => ({
    key: `fallback-${i}`,
    ...item,
  }));
  const newsUpdates: HomeNewsItem[] = [...fromDb, ...fallbackWithKeys].slice(0, 8);

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
          <h1 className="pb-display mt-5 max-w-3xl tracking-tight text-[var(--pb-ink)]">
            <span className="block text-[2.125rem] leading-[1.04] sm:text-4xl md:text-[2.75rem]">
              PermaBrella
            </span>
            <span className="mt-1 block text-[1.5rem] leading-[1.12] sm:text-[1.8rem] md:text-[2rem]">
              Northern Rivers permaculture hub
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--pb-ink-soft)] md:text-[17px]">
            Connecting people, land, skills, events, and practical knowledge to
            grow food security and community resilience in the Northern Rivers.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-2">
            <Link
              href="/submit"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-primary)] px-5 py-3 text-base font-semibold text-white transition hover:bg-[var(--pb-primary-dk)]"
            >
              Post to the switchboard
            </Link>
            <Link
              href="/how-it-works"
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
              PermaBrella helps turn local capacity into local action — growing food,
              participation, and resilience in the process.
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
            <div className="relative flex flex-col items-center">
              <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-[var(--pb-muted)]">
                Visual menu - click an icon to navigate
              </p>
              <HeroHubArt logoSize={68} items={hubItems} centerHref="/" />
            </div>
          </div>
        </div>
        <div className="relative z-10 hidden min-h-[260px] md:block">
          <div className="relative flex h-full min-h-[280px] flex-col items-center justify-center p-6 sm:p-8">
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-[var(--pb-muted)]">
              Visual menu - click an icon to navigate
            </p>
            <HeroHubArt logoSize={84} items={hubItems} centerHref="/" />
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[var(--pb-ink)] md:text-lg">
            News and updates
          </h2>
          <Link
            href="/news/new"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--pb-r-sm)] border border-[var(--pb-line)] bg-[var(--pb-surface)] px-3.5 py-2 text-sm font-semibold text-[var(--pb-ink)] transition hover:bg-[var(--pb-bg)]"
          >
            Add a news item
          </Link>
        </div>
        {newsUpdates.length ? (
          <ul className="mt-4 space-y-3">
            {newsUpdates.map((item) => (
              <li
                key={item.key}
                className="rounded-[var(--pb-r-md)] border border-[var(--pb-line)] bg-[var(--pb-surface)] p-4 shadow-[var(--pb-shadow-card)]"
              >
                <h3 className="text-base font-semibold text-[var(--pb-ink)]">
                  {item.href ? (
                    <Link href={item.href} className="hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="mt-1 text-sm text-[var(--pb-muted)]">{item.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-[var(--pb-r-md)] border border-dashed border-[var(--pb-line)] bg-[var(--pb-surface)] px-4 py-5 text-sm text-[var(--pb-muted)]">
            No updates posted yet. This section will highlight noteworthy
            regional news and major project updates.
          </div>
        )}
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
