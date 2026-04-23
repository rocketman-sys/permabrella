import Link from "next/link";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { TopicCard } from "@/components/community/TopicCard";
import { listTopicsOrdered } from "@/lib/community/service";

export default async function CommunityPage() {
  const topicRows = await listTopicsOrdered();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeroBar
        title="Community Q&A"
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
