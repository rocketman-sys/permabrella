import { GrantFilters } from "@/components/posts/GrantFilters";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { PostList } from "@/components/posts/PostList";
import { GrantsClosingSoon } from "@/components/posts/GrantsClosingSoon";
import { ConservationSupport } from "@/components/posts/ConservationSupport";
import { listGrantsClosingSoon, listPostsByType } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";
import { matchesGrantFilters, parseGrantFilters } from "@/lib/posts/grant-filters";

export const metadata = pageMetadata({
  title: "Community grants | PermaBrella",
  description: "Explore grants closing soon, funding rounds and conservation support for Northern Rivers communities and landholders.",
  path: "/grants",
});

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string | string[]; view?: string | string[]; applicant?: string | string[]; funding?: string | string[] }>;
}) {
  const [session, query] = await Promise.all([auth(), searchParams]);
  const region = parseRegionParam(typeof query.region === "string" ? query.region : null);
  const filters = parseGrantFilters(query);
  const filtered = Boolean(region) || filters.applicant !== "all" || filters.funding !== "all";
  const view = filters.funding === "closed" ? "past" : "current";
  const now = new Date();
  const [items, deadlines] = await Promise.all([
    listPostsByType({ type: "grant", region, view, limit: 100 }),
    view === "current" ? listGrantsClosingSoon({ region, now }) : Promise.resolve([]),
  ]);
  const matches = items.filter(({ post }) => matchesGrantFilters(post, filters, now));
  const closingSoon = deadlines.filter((post) => matchesGrantFilters(post, filters, now));
  const closingIds = new Set(closingSoon.map((grant) => grant.id));
  const directories = items.filter(({ post }) => post.metadata.statusLabel === "Ongoing resource");
  const otherItems = matches.filter(({ post }) => !closingIds.has(post.id));
  const total = new Set([...matches.map(({ post }) => post.id), ...closingIds]).size;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="Community grants & offerings"
        iconSrc="/brand/icon-grants.svg"
        subtitle="Find funding for local communities, growing food and caring for land across the Northern Rivers."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              href={session?.user ? "/grants/new" : "/login?callbackUrl=/grants/new"}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              Submit a grant
            </Link>
          </div>
        }
      />
      <p className="text-sm text-[var(--pb-ink-soft)]">Dates and eligibility can change. Check the provider’s current round before applying.</p>
      {view === "current" ? <a href="#conservation-support" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">Explore conservation programs &amp; support</a> : null}

      <GrantFilters region={region} {...filters} filtered={filtered} />
      <section id="grant-results" aria-labelledby="grant-results-heading" className="mt-6 scroll-mt-24">
        <h2 id="grant-results-heading" className="text-lg font-semibold text-[var(--perm-primary)]">{total} {total === 1 ? "grant" : "grants"}{filtered ? " matching your filters" : " listed"}</h2>
        {total === 0 ? <div className="mt-4 rounded-xl border border-dashed border-[var(--pb-line)] bg-[var(--pb-surface)] p-5">
          <p className="font-semibold">No grants match this selection</p>
          <p className="mt-2 text-sm text-[var(--pb-ink-soft)]">Try a different applicant type, region or funding status. New and undated opportunities may still need their eligibility confirmed.</p>
          <Link href="/grants#grant-results" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline">Clear filters and browse grants</Link>
        </div> : <>
          {view === "current" ? <GrantsClosingSoon grants={closingSoon} filtered={filtered} /> : null}
          {otherItems.length ? <div className="mt-6">
            <h3 className="text-lg font-semibold text-[var(--perm-primary)]">{view === "past" ? "Past & closed rounds" : closingSoon.length ? "More grants & funding" : "Grant listings"}</h3>
            <div className="mt-4"><PostList items={otherItems} basePath="/grants" region={region} view={view} /></div>
          </div> : null}
        </>}
      </section>

      {directories.length ? <section className="mt-8" aria-labelledby="funding-directories-heading">
        <h2 id="funding-directories-heading" className="text-lg font-semibold text-[var(--perm-primary)]">Funding directories</h2>
        <p className="mt-2 text-sm text-[var(--pb-ink-soft)]">Search services for finding funding rounds. These are separate from the grant results and applicant/status filters above.</p>
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
