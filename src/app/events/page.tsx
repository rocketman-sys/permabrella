import Link from "next/link";
import { Suspense } from "react";
import { PostList } from "@/components/posts/PostList";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { listPostsByType } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region: regionQ } = await searchParams;
  const region = parseRegionParam(regionQ ?? null);
  const items = await listPostsByType({ type: "event", region, limit: 60 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
            Events &amp; workshops
          </h1>
          <p className="mt-2 text-[var(--perm-text-secondary)]">
            Local gatherings, skill shares, and listings synced from Eventbrite or Humanitix
            when configured.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/events/new"
            className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Add an event
          </Link>
        </div>
      </div>

      <div className="mt-8 flex max-w-xs flex-col gap-1">
        <label htmlFor="events-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="events-region" />
        </Suspense>
      </div>

      <div className="mt-8">
        <PostList items={items} basePath="/events" />
      </div>
    </div>
  );
}
