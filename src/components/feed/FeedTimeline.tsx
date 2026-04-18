import Link from "next/link";
import { PostCard } from "@/components/posts/PostCard";
import { listRecentForFeed } from "@/lib/posts/service";

export async function FeedTimeline() {
  const { events, directory } = await listRecentForFeed({ limit: 8 });

  if (!events.length && !directory.length) {
    return (
      <section aria-labelledby="feed-heading">
        <h2 id="feed-heading" className="sr-only">
          Recent activity
        </h2>
        <div className="rounded-xl border border-dashed border-[var(--perm-border)] bg-[var(--perm-card)] px-4 py-8 text-center text-sm text-[var(--perm-text-secondary)]">
          No listings yet.{" "}
          <Link href="/events/new" className="font-medium text-[var(--perm-secondary)] hover:underline">
            Add an event
          </Link>{" "}
          or{" "}
          <Link href="/directory/new" className="font-medium text-[var(--perm-secondary)] hover:underline">
            list a group
          </Link>
          .
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="feed-heading" className="space-y-8">
      <h2 id="feed-heading" className="sr-only">
        Recent activity
      </h2>
      {events.length ? (
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--perm-primary)]">
              Recent events
            </h3>
            <Link href="/events" className="text-sm text-[var(--perm-secondary)] hover:underline">
              View all
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {events.map((item) => (
              <li key={item.post.id}>
                <PostCard item={item} href={`/events/${item.post.id}`} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {directory.length ? (
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--perm-primary)]">
              Directory highlights
            </h3>
            <Link href="/directory" className="text-sm text-[var(--perm-secondary)] hover:underline">
              View all
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {directory.map((item) => (
              <li key={item.post.id}>
                <PostCard item={item} href={`/directory/${item.post.id}`} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
