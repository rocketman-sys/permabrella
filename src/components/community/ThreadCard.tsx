import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatPosted } from "@/lib/posts/format";
import type { ThreadListRow } from "@/lib/community/service";
import { REGIONS } from "@/lib/regions";
import { AuthorIdentity } from "./AuthorIdentity";

function regionLabel(value: string | null): string | null {
  if (!value) return null;
  return REGIONS.find((r) => r.value === value)?.label ?? value;
}

export function ThreadCard({
  row,
  topicSlug,
}: {
  row: ThreadListRow;
  topicSlug: string;
}) {
  const { thread, authorDisplay, authorBadge } = row;

  return (
    <Link
      href={`/community/${topicSlug}/${thread.id}`}
      className="group block"
    >
      <Card className="transition group-hover:border-[var(--perm-secondary)]/40 group-hover:shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="font-medium text-[var(--perm-primary)] group-hover:text-[var(--perm-secondary)]">
            {thread.isPinned ? (
              <span className="mr-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--perm-earth)]">
                Pinned
              </span>
            ) : null}
            {thread.title}
          </h2>
          {regionLabel(thread.region) ? (
            <Badge className="shrink-0">{regionLabel(thread.region)}</Badge>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--perm-text-secondary)]">
          {thread.body}
        </p>
        <p className="mt-3 text-xs text-[var(--perm-muted)]">
          <AuthorIdentity name={authorDisplay} badge={authorBadge} /> ·{" "}
          {thread.replyCount}{" "}
          {thread.replyCount === 1 ? "reply" : "replies"} · Active{" "}
          {formatPosted(thread.lastActivityAt)}
        </p>
      </Card>
    </Link>
  );
}
