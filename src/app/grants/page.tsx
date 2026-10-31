import { ListingViewFilter } from "@/components/posts/ListingViewFilter";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { PostList } from "@/components/posts/PostList";
import { GrantsClosingSoon } from "@/components/posts/GrantsClosingSoon";
import { ConservationSupport } from "@/components/posts/ConservationSupport";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { listGrantsClosingSoon, listPostsByType } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";

export const metadata = pageMetadata({
  title: "Community grants | PermaBrella",
  description: "Explore grants closing soon, funding rounds and conservation support for Northern Rivers communities and landholders.",
  path: "/grants",
});

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; view?: string }>;
}) {
  const [session, { region: regionQ, view: viewQ }] = await Promise.all([auth(), searchParams]);
  const region = parseRegionParam(regionQ ?? null);
  const view = viewQ === "past" ? "past" : "current";
  const [items, closingSoon] = await Promise.all([
    listPostsByType({ type: "grant", region, view, limit: 100 }),
    view === "current" ? listGrantsClosingSoon({ region }) : Promise.resolve([]),
  ]);
  const closingIds = new Set(closingSoon.map((grant) => grant.id));
  const directories = items.filter(({ post }) => post.metadata.statusLabel === "Ongoing resource");
  const otherItems = items.filter(({ post }) => !closingIds.has(post.id) && post.metadata.statusLabel !== "Ongoing resource");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="Community grants & offerings"
        iconSrc="/brand/icon-grants.svg"
        subtitle="A starting point for funding rounds, in-kind support, and programs that strengthen permaculture, food security, and resilience across the Northern Rivers."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={session?.user ? "/grants/new" : "/login?callbackUrl=/grants/new"}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              Submit a grant
            </Link>
            <Link
              href="/submit"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--perm-border)] bg-[var(--perm-card)] px-4 py-2 text-sm font-medium text-[var(--perm-primary)] hover:border-[var(--perm-secondary)]/40"
            >
              Post via switchboard
            </Link>
          </div>
        }
      />
      <p className="text-sm text-[var(--pb-ink-soft)]">Dates and eligibility can change. Check the provider’s current round before applying.</p>
      {view === "current" ? <a href="#conservation-support" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">Explore conservation programs &amp; support</a> : null}

      <div className="mt-8 flex max-w-xs flex-col gap-1">
        <label htmlFor="grants-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="grants-region" />
        </Suspense>
      </div>

      <ListingViewFilter basePath="/grants" view={view} region={region} />
      {view === "current" ? <GrantsClosingSoon grants={closingSoon} filtered={Boolean(region)} /> : null}
      <div className="mt-5">
        <h2 className="text-lg font-semibold text-[var(--perm-primary)]">{view === "past" ? "Past & closed rounds" : closingSoon.length ? "More grants & funding" : "Grant listings"}</h2>
        <div className="mt-4">
          {otherItems.length || !closingSoon.length ? <PostList items={otherItems} basePath="/grants" region={region} view={view} /> : <p className="text-sm text-[var(--pb-ink-soft)]">All current listings for this region are shown above.</p>}
        </div>
      </div>

      {directories.length ? <section className="mt-8" aria-labelledby="funding-directories-heading">
        <h2 id="funding-directories-heading" className="text-lg font-semibold text-[var(--perm-primary)]">Funding directories</h2>
        <p className="mt-2 text-sm text-[var(--pb-ink-soft)]">Search services for finding funding rounds. These are not individual grants.</p>
        <div className="mt-4"><PostList items={directories} basePath="/grants" region={region} view={view} /></div>
      </section> : null}

      {view === "current" ? <ConservationSupport /> : null}

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--perm-primary)]">Related on PermaBrella</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/directory"
            className="inline-flex rounded-lg border border-[var(--perm-border)] bg-[var(--perm-card)] px-4 py-3 text-sm font-medium text-[var(--perm-primary)] transition hover:border-[var(--perm-secondary)]/40 hover:shadow-sm"
          >
            Community groups &amp; foundations
          </Link>
          <Link
            href="/offerings"
            className="inline-flex rounded-lg border border-[var(--perm-border)] bg-[var(--perm-card)] px-4 py-3 text-sm font-medium text-[var(--perm-primary)] transition hover:border-[var(--perm-secondary)]/40 hover:shadow-sm"
          >
            Offerings, Wants &amp; Exchange
          </Link>
          <Link
            href="/submit"
            className="inline-flex rounded-lg border border-[var(--perm-border)] bg-[var(--perm-card)] px-4 py-3 text-sm font-medium text-[var(--perm-primary)] transition hover:border-[var(--perm-secondary)]/40 hover:shadow-sm"
          >
            Post to the switchboard
          </Link>
        </div>
      </section>


    </div>
  );
}
