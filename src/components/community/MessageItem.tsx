import { AcknowledgeButton } from "./AcknowledgeButton";
import type { AcknowledgementState } from "@/lib/community/acknowledgement-queries";
import { SharedText } from "@/components/ui/SharedText";
import { formatPosted } from "@/lib/posts/format";
import type { MessageRow } from "@/lib/community/service";
import { AuthorIdentity } from "./AuthorIdentity";

export function MessageItem({ row, topicSlug, signedIn, acknowledgement }: { row: MessageRow; topicSlug:string; signedIn:boolean; acknowledgement:AcknowledgementState }) {
  const { message, authorDisplay, authorBadge } = row;

  return (
    <article
      className="rounded-xl border border-[var(--perm-border)] bg-[var(--perm-card)] px-4 py-3"
      id={`message-${message.id}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-[var(--perm-primary)]">
          <AuthorIdentity name={authorDisplay} badge={authorBadge} />
        </span>
        <time
          className="text-xs text-[var(--perm-muted)]"
          dateTime={message.createdAt.toISOString()}
        >
          {formatPosted(message.createdAt)}
        </time>
      </header>
      <div className="mt-2 whitespace-pre-wrap text-sm text-[var(--perm-text)]">
        <SharedText text={message.body} />
      </div>
      <AcknowledgeButton target={{threadId:message.threadId,topicSlug,messageId:message.id}} initial={acknowledgement} signedIn={signedIn} />
    </article>
  );
}
