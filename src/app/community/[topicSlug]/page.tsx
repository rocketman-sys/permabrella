import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ThreadCard } from "@/components/community/ThreadCard";
import { RegionFilter } from "@/components/layout/RegionFilter";
import { getTopicBySlug, listThreadsForTopic, recentThreadCard } from "@/lib/community/service";
import { parseRegionParam } from "@/lib/regions";
import { RecentlyActiveThreads } from "@/components/community/RecentlyActiveThreads";
import { recentlyActive } from "@/lib/community/activity";
import { connection } from "next/server";

export default async function TopicThreadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicSlug: string }>;
  searchParams: Promise<{ region?: string }>;
}) {
  const { topicSlug } = await params;
  const { region: regionQ } = await searchParams;
  const topic = await getTopicBySlug(topicSlug);
  if (!topic) notFound();

  const region = parseRegionParam(regionQ ?? null);
  await connection();
  const now = new Date();
  const threads = await listThreadsForTopic(topic.id, region, now);
  const recentRows = recentlyActive(threads, now.getTime()).map((row) => recentThreadCard(row, topic.slug, topic.name));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm">
        <Link href="/community" className="text-[var(--perm-secondary)] hover:underline">
          Community
        </Link>
      </nav>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
            {topic.name}
          </h1>
          {topic.description ? (
            <p className="mt-2 text-[var(--perm-text-secondary)]">{topic.description}</p>
          ) : null}
        </div>
        <Link
          href={`/community/new?topic=${encodeURIComponent(topic.slug)}`}
          className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          New thread in this topic
        </Link>
      </div>

      <div className="mt-8 flex max-w-xs flex-col gap-1">
        <label htmlFor="topic-region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
          <RegionFilter id="topic-region" />
        </Suspense>
      </div>

      <RecentlyActiveThreads rows={recentRows} initialNow={now.getTime()} />
      <h2 className="mt-8 text-xl font-semibold text-[var(--perm-primary)]">All threads</h2>
      <ul className="mt-4 space-y-3">
        {threads.map((row) => (
          <li key={row.thread.id}>
            <ThreadCard row={row} topicSlug={topic.slug} now={now.getTime()} />
          </li>
        ))}
      </ul>

      {threads.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--perm-muted)]">
          No threads here yet.{" "}
          <Link href={`/community/new?topic=${encodeURIComponent(topic.slug)}`} className="text-[var(--perm-secondary)] hover:underline">
            Start the first one
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
