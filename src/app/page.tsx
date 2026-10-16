import Link from "next/link";
import { Suspense } from "react";
import { FeedTimeline } from "@/components/feed/FeedTimeline";
import { QuickAccessCard } from "@/components/brand/QuickAccessCard";
import { HeroStats } from "@/components/brand/HeroStats";
import { GlobalSearchForm } from "@/components/search/GlobalSearchForm";
import { getHeroStats, listNewsPostsSafe } from "@/lib/posts/service";
import { formatPosted } from "@/lib/posts/format";
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
        <Suspense fallback={<HeroStats />}><HomeStats /></Suspense>
      </section>
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
