import { ListingViewFilter } from "@/components/posts/ListingViewFilter";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { PostList } from "@/components/posts/PostList";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { listPostsByTypes } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";

export const metadata: Metadata = { title: "Give, swap or ask | PermaBrella" };

export default async function OfferingsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; view?: string }>;
}) {
  const { region: regionQ, view: viewQ } = await searchParams;
  const region = parseRegionParam(regionQ ?? null);
  const view = viewQ === "past" ? "past" : "current";
  const items = await listPostsByTypes({
    types: ["offering", "wanted"],
    region,
    view,
    limit: 80,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="Offerings, Wants & Exchange"
        iconSrc="/brand/icon-offerings.svg"
        subtitle="Classifieds for surplus, tools, seeds, swaps, and requests."
        actions={
          <Link
            href="/offerings/new"
            className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Add a listing
          </Link>
        }
      />

      <div className="mt-8 flex max-w-xs flex-col gap-1">
        <label htmlFor="offerings-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="offerings-region" />
        </Suspense>
      </div>

      <ListingViewFilter basePath="/offerings" view={view} region={region} />
      <div className="mt-5">
        <PostList items={items} basePath="/offerings" region={region} view={view} />
      </div>
    </div>
  );
}
