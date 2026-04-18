import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { topics } from "@/lib/db/schema";

type Topic = typeof topics.$inferSelect;

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link href={`/community/${topic.slug}`} className="group block">
      <Card className="h-full transition group-hover:border-[var(--perm-secondary)]/40 group-hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold text-[var(--perm-primary)] group-hover:text-[var(--perm-secondary)]">
            {topic.name}
          </h2>
          <span className="shrink-0 text-xs text-[var(--perm-muted)]">
            {topic.threadCount} {topic.threadCount === 1 ? "thread" : "threads"}
          </span>
        </div>
        {topic.description ? (
          <p className="mt-2 text-sm text-[var(--perm-text-secondary)]">
            {topic.description}
          </p>
        ) : null}
      </Card>
    </Link>
  );
}
