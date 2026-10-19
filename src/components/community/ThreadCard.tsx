import { SharedText } from "@/components/ui/SharedText";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatPosted } from "@/lib/posts/format";
import type { ThreadCardRow } from "@/lib/community/service";
import { REGIONS } from "@/lib/regions";
import { AuthorIdentity } from "./AuthorIdentity";
import { isNewUnanswered, recentReplyTimes, relativeReplyTime } from "@/lib/community/activity";
import { NewThreadBadge } from "./NewThreadBadge";

function regionLabel(value: string | null): string | null {
  if (!value) return null;
  return REGIONS.find((r) => r.value === value)?.label ?? value;
}

export function ThreadCard({
  row,
  topicSlug,
  topicName,
  now,
  recent = false,
}: {
  row: ThreadCardRow;
  topicSlug: string;
  topicName?: string;
  now: number;
  recent?: boolean;
}) {
  const { thread, authorDisplay, authorBadge } = row;
  const recentTimes = recentReplyTimes(row.activity, now);
  const latest = Math.max(...recentTimes);

  return (
    <div className="group relative min-w-0 [overflow-wrap:anywhere]">
      <Card className={`transition group-hover:border-[var(--perm-secondary)]/40 group-hover:shadow-md ${recent ? "border-emerald-200 bg-emerald-50/70" : ""}`}>
        {recent ? <p className="mb-2 text-xs font-semibold text-emerald-900">Recent replies{topicName ? ` · ${topicName}` : ""}</p> : null}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-medium text-[var(--perm-primary)] group-hover:text-[var(--perm-secondary)]">
            {thread.isPinned ? (
              <span className="mr-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--perm-earth)]">
                Pinned
              </span>
            ) : null}
            <Link href={`/community/${topicSlug}/${thread.id}`} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--pb-accent-2)]">{thread.title}</Link>
          </h3>
          {isNewUnanswered(thread.createdAt.getTime(), row.activity.totalReplyCount, now) ? <NewThreadBadge createdAt={thread.createdAt.getTime()} initialNow={now} /> : null}
          {regionLabel(thread.region) ? (
            <Badge className="shrink-0">{regionLabel(thread.region)}</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-[var(--perm-text-secondary)]">
          <SharedText text={thread.body} maxLength={220} />
        </p>
        <p className="mt-3 text-xs text-[var(--perm-muted)]">
          <AuthorIdentity name={authorDisplay} badge={authorBadge} /> ·{" "}
          {recent ? <>{recentTimes.length} {recentTimes.length === 1 ? "reply" : "replies"} in the past 7 days · Last reply <time dateTime={new Date(latest).toISOString()} title={new Date(latest).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}>{relativeReplyTime(latest, now)}</time></> : <>{row.activity.totalReplyCount} {row.activity.totalReplyCount === 1 ? "reply" : "replies"} · {row.activity.lastReplyAt ? <>Last reply {formatPosted(row.activity.lastReplyAt)}</> : <>Started {formatPosted(thread.createdAt)}</>}</>}
        </p>
      </Card>
    </div>
  );
}
