import Link from "next/link";
import { Suspense } from "react";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { PostList } from "@/components/posts/PostList";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { listPostsByTypes } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";

export default async function OfferingsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region: regionQ } = await searchParams;
  const region = parseRegionParam(regionQ ?? null);
  const items = await listPostsByTypes({
    types: ["offering", "wanted"],
    region,
    limit: 80,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="Offerings, Wants & Exchange"
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

      <div className="mt-8">
        <PostList items={items} basePath="/offerings" />
      </div>
    </div>
  );
}
