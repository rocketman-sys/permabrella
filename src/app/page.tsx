import { LatestConversations } from "@/components/community/LatestConversations";
import Link from "next/link";
import { Suspense } from "react";
import { FeedTimeline } from "@/components/feed/FeedTimeline";
import { QuickAccessCard } from "@/components/brand/QuickAccessCard";
import { HeroStats } from "@/components/brand/HeroStats";
import { GlobalSearchForm } from "@/components/search/GlobalSearchForm";
import { getHeroStats, listNewsPostsSafe } from "@/lib/posts/service";
import { formatPosted } from "@/lib/posts/format";
import { FOUNDING_PARTNER_LABEL, ROOTS_RIVERS_GROUP_ID } from "@/lib/posts/featured-groups";
import { parseRegionParam, type Region } from "@/lib/regions";

const panels = [
  { href: "/directory", title: "Find a local group", blurb: "Community gardens, growers and neighbours.", icon: "/brand/icon-groups.svg" },
  { href: "/events", title: "Join an event", blurb: "Workshops, working bees and skill shares.", icon: "/brand/icon-events.svg" },
  { href: "/offerings", title: "Give, swap or ask", blurb: "Share produce, seeds, tools and skills.", icon: "/brand/icon-offerings.svg" },
  { href: "/land-connect", title: "Connect over land", blurb: "Find growing space or someone to help.", icon: "/brand/icon-land.svg" },
  { href: "/grants", title: "Find funding", blurb: "Grants and support for local projects.", icon: "/brand/icon-grants.svg" },
  { href: "/community", title: "Ask the community", blurb: "Practical knowledge, shared locally.", icon: "/brand/icon-qa.svg" },
];

export default async function Home({ searchParams }: {
  searchParams: Promise<{ region?: string }>;
}) {
  const region = parseRegionParam((await searchParams).region ?? null);
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 md:py-10">
      <section aria-labelledby="home-heading" className="rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-5 sm:p-8">
        <div className="flex items-start justify-between gap-8">
          <div className="max-w-2xl">
            <p className="pb-tag text-[var(--pb-accent-2)]">Northern Rivers, NSW</p>
            <h1 id="home-heading" className="pb-display mt-2 text-3xl leading-tight text-[var(--pb-ink)] sm:text-4xl">Grow food. Share what you have.<br className="hidden sm:block" /> Find your community.</h1>
            <p className="mt-3 max-w-xl text-base text-[var(--pb-ink-soft)]">Your local permaculture hub for people, growing spaces, skills and opportunities.</p>
          </div>
          <Link href="/how-it-works" className="hidden shrink-0 py-3 text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4 md:block">How it works</Link>
        </div>
        <div className="mt-5"><GlobalSearchForm topics={[]} initialRegion={region ?? ""} home /></div>
        <p className="mt-3 text-sm text-[var(--pb-ink-soft)]">Looking for a starting point? <Link href="/helper" className="inline-flex min-h-11 items-center font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">Ask the PermaBrella Helper</Link> for local connections and growing guidance.</p>
        <Suspense fallback={<HeroStats />}><HomeStats /></Suspense>
      </section>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <section aria-labelledby="roots-rivers-heading" className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-5 sm:p-6">
          <div>
            <p className="pb-tag text-[var(--pb-accent-2)]">Featured group</p>
            <h2 id="roots-rivers-heading" className="pb-display mt-1 text-xl sm:text-2xl">Roots &amp; Rivers Collective</h2>
            <p className="mt-2 text-sm font-semibold text-[var(--pb-accent-2)]">{FOUNDING_PARTNER_LABEL}</p>
            <p className="mt-1 text-sm text-[var(--pb-ink-soft)]">Growing food, caring for land and turning shared ideas into local action.</p>
          </div>
          <Link href={`/directory/${ROOTS_RIVERS_GROUP_ID}`} className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--pb-accent-2)] px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-[var(--pb-ink)] sm:self-start">
            Meet Roots &amp; Rivers
          </Link>
        </section>
        <section aria-labelledby="permablitz-heading" className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-5 sm:p-6">
          <div>
            <p className="pb-tag text-[var(--pb-accent-2)]">Featured community</p>
            <h2 id="permablitz-heading" className="pb-display mt-1 text-xl sm:text-2xl">Permablitz Northern Rivers</h2>
            <p className="mt-2 text-sm text-[var(--pb-ink-soft)]">Connect with the local group on Facebook.</p>
          </div>
          <a href="https://www.facebook.com/groups/1474514084161615" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--pb-accent-2)] px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-[var(--pb-ink)] sm:self-start">
            Visit Facebook group <span aria-hidden="true">↗</span><span className="sr-only"> — Permablitz Northern Rivers (opens in a new tab)</span>
          </a>
        </section>
      </div>
      <Suspense fallback={<p className="mt-8 text-sm" role="status">Loading latest conversations…</p>}><LatestConversations region={region} /></Suspense>
      <div className="mt-7 sm:mt-9">
        <Suspense fallback={<p className="rounded-lg bg-[var(--pb-surface)] p-5" role="status">Finding local connections…</p>}><FeedTimeline region={region} /></Suspense>
      </div>
      <section className="mt-10" aria-labelledby="browse-heading">
        <h2 id="browse-heading" className="pb-display text-2xl">Explore the community</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{panels.map((p) => <QuickAccessCard key={p.href} href={region ? `${p.href}?region=${region}` : p.href} iconSrc={p.icon} iconAlt="" title={p.title} description={p.blurb} />)}</div>
      </section>
      <Suspense fallback={null}><HomeNews region={region} /></Suspense>
      <section className="mt-10 flex flex-col gap-4 rounded-xl bg-[var(--pb-accent-2)] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="pb-display text-2xl">A little to share can go a long way.</h2><p className="mt-2 max-w-xl text-sm">Spare seedlings, a patch of land, a working bee or a question. Help your neighbours find it here.</p></div>
        <Link href="/submit" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-[var(--pb-surface)] px-5 py-3 font-semibold text-[var(--pb-accent-2)]">Post a listing</Link>
      </section>
    </div>
  );
}

async function HomeStats() {
  const stats = await getHeroStats();
  return <HeroStats stats={stats} />;
}

async function HomeNews({ region }: { region?: Region }) {
  const news = await listNewsPostsSafe({ region, limit: 3 });
  return (
news.length > 0 ? (
        <section className="mt-10" aria-labelledby="news-heading">
          <div className="flex items-center justify-between gap-3"><h2 id="news-heading" className="pb-display text-2xl">Community news</h2><Link href="/news" className="py-3 text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">All news</Link></div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">{news.map(({ post }) => (
            <li key={post.id} className="rounded-lg border border-[var(--pb-line)] bg-[var(--pb-surface)] p-5">
              <p className="text-xs text-[var(--pb-muted)]"><time dateTime={post.createdAt.toISOString()}>{formatPosted(post.createdAt)}</time></p>
              <h3 className="mt-2 font-semibold"><Link href={`/news/${post.id}`} className="hover:underline">{post.title}</Link></h3>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--pb-ink-soft)]">{post.description}</p>
            </li>))}</ul>
        </section>
      ) : null
  );
}
