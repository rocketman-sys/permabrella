import Link from "next/link";
import type { PostWithAuthor } from "@/lib/posts/service";
import { REGIONS, type Region } from "@/lib/regions";
import { PostCard } from "./PostCard";

type BasePath = "/events" | "/directory" | "/grants" | "/news" | "/offerings" | "/land-connect";
const emptyCopy: Record<BasePath, { title: string; body: string; action: string }> = {
  "/events": { title: "Make the next gathering happen", body: "No upcoming events are listed here yet. Bring people together for a workshop, seed swap or working bee.", action: "Add an event" },
  "/offerings": { title: "Something to share? Something you need?", body: "No exchanges are listed here yet. Offer spare seedlings, share surplus produce or ask to borrow a tool. A small post can start a useful local connection.", action: "Offer something or make a request" },
  "/land-connect": { title: "Growing space meets helping hands", body: "No land connections are listed here yet. Offer a garden patch, look for land to grow on or invite help caring for an orchard.", action: "Offer land or find growing space" },
  "/directory": { title: "Help neighbours find their people", body: "No community groups are listed here yet. Add a community garden, growers’ network or local organisation.", action: "Add a community group" },
  "/grants": { title: "Know a funding opportunity?", body: "No current or undated funding listings are shown here. Share a grant, community program or in-kind support opportunity.", action: "Share a funding opportunity" },
  "/news": { title: "What’s growing in your community?", body: "No community news has been posted yet. Share a garden milestone, a local project or a story about neighbours working together.", action: "Share community news" },
};

export function PostList({ items, basePath, region, view = "current" }: {
  items: PostWithAuthor[];
  basePath: BasePath;
  region?: Region;
  view?: "current" | "past";
}) {
  if (!items.length) {
    const copy = emptyCopy[basePath];
    const area = REGIONS.find((r) => r.value === region)?.label;
    return <div className="rounded-xl border border-dashed border-[var(--pb-line)] bg-[var(--pb-surface)] p-6 sm:p-8">
      <h2 className="text-xl font-semibold">{view === "past" ? "No past listings to show" : area ? `No matching listings in ${area}` : copy.title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--pb-ink-soft)]">{view === "past" ? "Past events and listings with a closed round or an expired deadline appear here." : area ? "Try all regions to find nearby connections, or share an opportunity for your area." : copy.body}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {region ? <Link href={`${basePath}${view === "past" ? "?view=past" : ""}`} className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--pb-line)] px-4 py-3 text-sm font-semibold">Show all regions</Link> : null}
        {view === "past" ? <Link href={`${basePath}${region ? `?region=${region}` : ""}`} className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--pb-accent-2)] px-4 py-3 text-sm font-semibold text-white">Browse current listings</Link> : <Link href={`${basePath}/new`} className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--pb-primary)] px-4 py-3 text-center text-sm font-semibold text-white">{copy.action}</Link>}
        {basePath !== "/directory" && view !== "past" ? <Link href="/directory" className="inline-flex min-h-11 items-center justify-center px-2 py-3 text-sm font-semibold text-[var(--pb-accent-2)] underline">Find a local group</Link> : null}
      </div>
      {view !== "past" ? <p className="mt-3 text-xs text-[var(--pb-muted)]">Browsing is open to everyone. Sign in or create a free account to post.</p> : null}
    </div>;
  }
  return <ul className="grid gap-4 lg:grid-cols-2">{items.map((item) => <li key={item.post.id}><PostCard item={item} href={`${basePath}/${item.post.id}`} /></li>)}</ul>;
}
