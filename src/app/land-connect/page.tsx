import { ListingViewFilter } from "@/components/posts/ListingViewFilter";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { PostCard } from "@/components/posts/PostCard";
import { PostList } from "@/components/posts/PostList";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { listPostsByTypes, listLandConnectNetworks } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";

export const metadata: Metadata = { title: "Land Connect | PermaBrella" };

export default async function LandConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; view?: string }>;
}) {
  const { region: regionQ, view: viewQ } = await searchParams;
  const region = parseRegionParam(regionQ ?? null);
  const view = viewQ === "past" ? "past" : "current";
  const items = await listPostsByTypes({
    types: ["land_available", "land_wanted"],
    region,
    view,
    limit: 80,
  });

  const land = items.filter(({ post }) => !post.metadata.landConnectCategory);
  const leads = items.filter(({ post }) => post.metadata.landConnectCategory === "lead");
  const resources = [...items.filter(({ post }) => post.metadata.landConnectCategory === "resource"), ...(view === "current" ? await listLandConnectNetworks(region) : [])];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="Land connect"
        iconSrc="/brand/icon-land.svg"
        subtitle="Explore land connections, farm work, exchanges and support. Each listing explains its scope and what still needs checking."
        actions={
          <Link
            href="/land-connect/new"
            className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Add a listing
          </Link>
        }
      />

      <div className="mt-8 flex max-w-xs flex-col gap-1">
        <label htmlFor="land-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="land-region" />
        </Suspense>
      </div>

      <ListingViewFilter basePath="/land-connect" view={view} region={region} />
      <div className="mt-5">
        <h2 className="mb-3 text-xl font-semibold">Land and cultivation listings</h2>
        <PostList items={land} basePath="/land-connect" region={region} view={view} />
        {leads.length ? <section className="mt-8" aria-labelledby="work-leads"><h2 id="work-leads" className="text-xl font-semibold">Work and exchange leads</h2><p className="mb-4 mt-2 text-sm">Dated advertisements and unconfirmed leads. These do not offer ownership or a lease.</p><PostList items={leads} basePath="/land-connect" region={region} view={view} /></section> : null}
        {resources.length ? <section className="mt-8" aria-labelledby="land-resources"><h2 id="land-resources" className="text-xl font-semibold">Networks, platforms and support</h2><p className="mb-4 mt-2 text-sm">Local coverage does not confirm a vacancy. Check availability, membership fees and terms with the provider.</p><ul className="grid gap-4 sm:grid-cols-2">{resources.map(item => <li key={item.post.id}><PostCard item={item} href={`${item.post.type === "directory_entry" ? "/directory" : "/land-connect"}/${item.post.id}`} /></li>)}</ul></section> : null}
      </div>
    </div>
  );
}
