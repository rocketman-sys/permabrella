import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { PostList } from "@/components/posts/PostList";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { Card } from "@/components/ui/Card";
import { listPostsByType } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const session = await auth();
  const { region: regionQ } = await searchParams;
  const region = parseRegionParam(regionQ ?? null);
  const items = await listPostsByType({
    type: "grant",
    region,
    limit: 60,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
            Community grants &amp; offerings
          </h1>
          <p className="mt-2 text-[var(--perm-text-secondary)]">
            A starting point for funding rounds, in-kind support, and programs that strengthen
            permaculture, food security, and resilience across the Northern Rivers.
          </p>
        </div>
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
      </div>
      <p className="mt-3 max-w-2xl text-sm text-[var(--perm-text-secondary)]">
        Grant listings are visible to everyone. Publishing requires a free account — use either
        button above, or pick <strong className="font-medium text-[var(--perm-text)]">Grant or funding round</strong>{" "}
        from the switchboard menu.
      </p>

      <section className="mt-10 space-y-4 text-[var(--perm-text)]">
        <h2 className="text-lg font-semibold text-[var(--perm-primary)]">What you will find here</h2>
        <ul className="list-inside list-disc space-y-2 text-[var(--perm-text-secondary)]">
          <li>Philanthropic and community foundation grants with a regional or food-systems lens.</li>
          <li>Council, Landcare, and neighbourhood-centre programs that offer small project funding or support.</li>
          <li>In-kind offerings (equipment, venue time, mentorship) surfaced via the wider switchboard.</li>
        </ul>
      </section>

      <div className="mt-8 flex max-w-xs flex-col gap-1">
        <label htmlFor="grants-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="grants-region" />
        </Suspense>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--perm-primary)]">Listings</h2>
        <div className="mt-4">
          <PostList items={items} basePath="/grants" />
        </div>
      </div>

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
            Offerings &amp; wants
          </Link>
          <Link
            href="/submit"
            className="inline-flex rounded-lg border border-[var(--perm-border)] bg-[var(--perm-card)] px-4 py-3 text-sm font-medium text-[var(--perm-primary)] transition hover:border-[var(--perm-secondary)]/40 hover:shadow-sm"
          >
            Post to the switchboard
          </Link>
        </div>
      </section>

      <Card className="mt-10 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">
          Published grants appear in the list above for everyone. To add one, sign in and use
          <strong className="font-medium text-[var(--perm-text)]"> Submit a grant</strong> or{" "}
          <Link href="/submit" className="font-medium text-[var(--perm-secondary)] hover:underline">
            Post via switchboard
          </Link>
          . For organisations not yet listed, add them via the{" "}
          <Link href="/directory" className="font-medium text-[var(--perm-secondary)] hover:underline">
            community groups directory
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
