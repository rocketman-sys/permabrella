import { ListingViewFilter } from "@/components/posts/ListingViewFilter";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PostList } from "@/components/posts/PostList";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { listPostsByType } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";

export const metadata: Metadata = { title: "Events & workshops | PermaBrella" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; view?: string }>;
}) {
  const { region: regionQ, view: viewQ } = await searchParams;
  const region = parseRegionParam(regionQ ?? null);
  const view = viewQ === "past" ? "past" : "current";
  const items = await listPostsByType({ type: "event", region, view, limit: 60 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="Events & workshops"
        iconSrc="/brand/icon-events.svg"
        subtitle="Workshops, skill shares and working bees across the Northern Rivers. Check each listing for its date and how to join."
        actions={
          <Link
            href="/events/new"
            className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Add an event
          </Link>
        }
      />

      <div className="mt-8 flex max-w-xs flex-col gap-1">
        <label htmlFor="events-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="events-region" />
        </Suspense>
      </div>

      <ListingViewFilter basePath="/events" view={view} region={region} />
      <div className="mt-5">
        <PostList items={items} basePath="/events" region={region} view={view} />
      </div>
    </div>
  );
}
