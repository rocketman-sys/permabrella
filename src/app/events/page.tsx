import { ListingViewFilter } from "@/components/posts/ListingViewFilter";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Suspense } from "react";
import { PostList } from "@/components/posts/PostList";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { EVENT_STYLES, eventStyle, eventStyleLabel, parseEventStyle } from "@/lib/posts/event-styles";
import { listPostsByType } from "@/lib/posts/service";
import { parseRegionParam, type Region } from "@/lib/regions";

function eventsHref(region: Region | null | undefined, view: "current" | "past", style: string | null) {
  const query = new URLSearchParams();
  if (region) query.set("region", region);
  if (view === "past") query.set("view", "past");
  if (style) query.set("style", style);
  const text = query.toString();
  return text ? `/events?${text}` : "/events";
}

export const metadata = pageMetadata({
  title: "Events & workshops | PermaBrella",
  description: "Workshops, skill shares and working bees across the Northern Rivers. Find a gathering and check how to join.",
  path: "/events",
});

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; view?: string; style?: string }>;
}) {
  const { region: regionQ, view: viewQ, style: styleQ } = await searchParams;
  const region = parseRegionParam(regionQ ?? null);
  const view = viewQ === "past" ? "past" : "current";
  const style = parseEventStyle(styleQ);
  const listed = await listPostsByType({ type: "event", region, view, limit: 100 });
  const items = style ? listed.filter(({ post }) => eventStyle(post) === style) : listed;

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

      <nav aria-label="Event style" className="mt-8 flex flex-wrap gap-2">
        <Link href={eventsHref(region, view, null)} aria-current={style ? undefined : "page"} className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pb-primary)] ${style ? "border-[var(--pb-line)] bg-[var(--pb-surface)]" : "border-[var(--pb-accent-2)] bg-[var(--pb-accent-2)] text-white"}`}>All events</Link>
        {EVENT_STYLES.map((item) => <Link key={item.id} href={eventsHref(region, view, item.id)} aria-current={style === item.id ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pb-primary)] ${style === item.id ? "border-[var(--pb-accent-2)] bg-[var(--pb-accent-2)] text-white" : "border-[var(--pb-line)] bg-[var(--pb-surface)]"}`}>{item.label}</Link>)}
      </nav>

      <div className="mt-5 flex max-w-xs flex-col gap-1">
        <label htmlFor="events-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="events-region" />
        </Suspense>
      </div>

      <ListingViewFilter basePath="/events" view={view} region={region} style={style} />
      <div className="mt-5">
        {style && !items.length ? <div className="rounded-xl border border-dashed border-[var(--pb-line)] bg-[var(--pb-surface)] p-6">
          <h2 className="text-xl font-semibold">No {eventStyleLabel(style).toLowerCase()} in this selection</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--pb-ink-soft)]">Try another style, or show every event.</p>
          <Link href={eventsHref(region, view, null)} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline">Show all events</Link>
        </div> : <PostList items={items} basePath="/events" region={region} view={view} />}
      </div>
    </div>
  );
}
