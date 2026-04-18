import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPosted } from "@/lib/posts/format";
import type { MessageRow, ThreadDetail } from "@/lib/community/service";
import { threadPublicPath } from "@/lib/community/url";
import { REGIONS } from "@/lib/regions";
import { MessageItem } from "./MessageItem";
import { ReplyForm } from "./ReplyForm";
import { SubscriptionToggle } from "./SubscriptionToggle";

function regionLabel(value: string | null): string | null {
  if (!value) return null;
  return REGIONS.find((r) => r.value === value)?.label ?? value;
}

export default async function ThreadView({
  detail,
  messages,
  topicSlug,
  canReply,
}: {
  detail: ThreadDetail;
  messages: MessageRow[];
  topicSlug: string;
  canReply: boolean;
}) {
  const { thread, topic, authorDisplay } = detail;
  const locked = thread.isLocked;

  return (
    <div className="space-y-8">
      <nav className="text-sm">
        <Link href="/community" className="text-[var(--perm-secondary)] hover:underline">
          Community
        </Link>
        <span className="mx-2 text-[var(--perm-muted)]">/</span>
        <Link
          href={`/community/${topicSlug}`}
          className="text-[var(--perm-secondary)] hover:underline"
        >
          {topic.name}
        </Link>
      </nav>

      <header className="rounded-2xl border border-[var(--perm-border)] bg-[var(--perm-card)] px-6 py-6 shadow-sm sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold text-[var(--perm-primary)] sm:text-3xl">
            {thread.title}
          </h1>
          {regionLabel(thread.region) ? (
            <Badge>{regionLabel(thread.region)}</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-[var(--perm-muted)]">
          {authorDisplay ?? "Member"} · Started {formatPosted(thread.createdAt)}
          {locked ? (
            <span className="ml-2 font-medium text-[var(--perm-earth)]">
              · Locked
            </span>
          ) : null}
        </p>
        <div className="mt-4 whitespace-pre-wrap text-[var(--perm-text)]">
          {thread.body}
        </div>
        <div className="mt-4 border-t border-[var(--perm-border)] pt-4">
          <SubscriptionToggle threadId={thread.id} topicSlug={topicSlug} />
        </div>
      </header>

      <section aria-labelledby="replies-heading">
        <h2 id="replies-heading" className="text-lg font-semibold text-[var(--perm-primary)]">
          Replies ({messages.length})
        </h2>
        <ul className="mt-4 space-y-3">
          {messages.map((row) => (
            <li key={row.message.id}>
              <MessageItem row={row} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--perm-border)] bg-[var(--perm-card)] px-6 py-6 sm:px-8">
        <h2 className="text-lg font-semibold text-[var(--perm-primary)]">
          Add a reply
        </h2>
        {canReply ? (
          <div className="mt-4">
            <ReplyForm
              threadId={thread.id}
              topicSlug={topicSlug}
              disabled={locked}
              disabledReason="This thread is locked — no new replies."
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--perm-muted)]">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(threadPublicPath(topicSlug, thread.id))}`}
              className="text-[var(--perm-secondary)] hover:underline"
            >
              Sign in
            </Link>{" "}
            to join the conversation.
          </p>
        )}
      </section>
    </div>
  );
}
