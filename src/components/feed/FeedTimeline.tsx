import Link from "next/link";
import { PostCard } from "@/components/posts/PostCard";
import { listRecentForFeed } from "@/lib/posts/service";
import { REGIONS, type Region } from "@/lib/regions";

export async function FeedTimeline({ region }: { region?: Region }) {
  const { events, opportunities, funding } = await listRecentForFeed({ region });
  const area = REGIONS.find((r) => r.value === region)?.label;
  const localHref = (path: string) => region ? `${path}?region=${region}` : path;
  const connections = [...events, ...opportunities, ...funding];
  return (
    <section aria-labelledby="connections-heading" className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h2 id="connections-heading" className="pb-display text-2xl">Local connections{area ? ` in ${area}` : ""}</h2><p className="mt-1 text-sm text-[var(--pb-ink-soft)]">Coming up locally, grants closing soon and ways to lend a hand. Check listing details before making plans.</p></div>
        {region ? <Link href="/" className="py-3 text-sm text-[var(--pb-accent-2)] underline">Show all regions</Link> : null}
      </div>
      {connections.length > 0 ? <ul className="grid gap-3 sm:grid-cols-2">{connections.map((item) => (
        <li key={item.post.id}><PostCard compact item={item} href={`${item.post.type === "event" ? "/events" : item.post.type === "grant" ? "/grants" : item.post.type.startsWith("land_") ? "/land-connect" : "/offerings"}/${item.post.id}`} /></li>
      ))}</ul> : null}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-[var(--pb-accent-2)]">
        <Link href={localHref("/events")} className="inline-flex min-h-11 items-center underline underline-offset-4">All events</Link>
        <Link href={`${localHref("/grants")}#closing-soon`} className="inline-flex min-h-11 items-center underline underline-offset-4">Grants closing soon</Link>
        <Link href={localHref("/offerings")} className="inline-flex min-h-11 items-center underline underline-offset-4">Give, swap or ask</Link>
      </div>
      {events.length === 0 ? <p className="rounded-lg border border-[var(--pb-line)] bg-[var(--pb-surface)] px-4 py-3 text-sm text-[var(--pb-ink-soft)]">No upcoming events listed{area ? ` in ${area}` : ""} yet. Hosting a workshop or working bee? <Link href="/events/new" className="font-semibold text-[var(--pb-accent-2)] underline">Add your event</Link>.</p> : null}
    </section>
  );
}
