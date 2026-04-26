import Link from "next/link";
import { Suspense } from "react";
import { PostList } from "@/components/posts/PostList";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { listNewsPostsSafe } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region: regionQ } = await searchParams;
  const region = parseRegionParam(regionQ ?? null);
  const items = await listNewsPostsSafe({ region, limit: 60 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="News and updates"
        subtitle="Noteworthy regional news, project milestones, and hub announcements from the community."
        actions={
          <Link
            href="/news/new"
            className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Add a news item
          </Link>
        }
      />

      <div className="mt-8 flex max-w-xs flex-col gap-1">
        <label htmlFor="news-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="news-region" />
        </Suspense>
      </div>

      <div className="mt-8">
        <PostList items={items} basePath="/news" />
      </div>
    </div>
  );
}
