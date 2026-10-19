import Link from "next/link";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { TopicCard } from "@/components/community/TopicCard";
import { listRecentlyActiveThreads, listTopicsOrdered } from "@/lib/community/service";
import { RecentlyActiveThreads } from "@/components/community/RecentlyActiveThreads";
import { connection } from "next/server";

export default async function CommunityPage() {
  await connection();
  const now = new Date();
  const [topicRows, recentRows] = await Promise.all([listTopicsOrdered(), listRecentlyActiveThreads(now)]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="Community Q&A"
        iconSrc="/brand/icon-qa.svg"
        subtitle="Practical questions by topic — soil, water, land, preservation, and more."
        actions={
          <Link
            href="/community/new"
            className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            New thread
          </Link>
        }
      />

      <RecentlyActiveThreads rows={recentRows} initialNow={now.getTime()} />
      <h2 className="mt-8 text-xl font-semibold text-[var(--perm-primary)]">Browse topics</h2>
      {topicRows.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-[var(--perm-border)] px-4 py-8 text-center text-sm text-[var(--perm-muted)]">
          No topics yet. Run{" "}
          <code className="rounded bg-[var(--perm-bg)] px-1">npm run db:seed</code>.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {topicRows.map((topic) => (
            <li key={topic.id}>
              <TopicCard topic={topic} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
