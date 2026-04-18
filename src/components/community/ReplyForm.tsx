"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import {
  replyToThreadAction,
  type CommunityFormState,
} from "@/app/community/actions";

export function ReplyForm({
  threadId,
  topicSlug,
  disabled,
  disabledReason,
}: {
  threadId: string;
  topicSlug: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [state, formAction, pending] = useActionState<
    CommunityFormState,
    FormData
  >(replyToThreadAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state?.ok]);

  if (disabled) {
    return (
      <p className="rounded-lg bg-[var(--perm-bg)] px-4 py-3 text-sm text-[var(--perm-muted)]">
        {disabledReason ?? "Replies are closed."}
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="topicSlug" value={topicSlug} />
      <label htmlFor="reply-body" className="sr-only">
        Your reply
      </label>
      <textarea
        id="reply-body"
        name="body"
        required
        rows={4}
        placeholder="Share your experience or question…"
        className="w-full rounded-lg border border-[var(--perm-border)] bg-white px-3 py-2 text-[var(--perm-text)] placeholder:text-[var(--perm-muted)] focus:border-[var(--perm-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--perm-secondary)]/30"
      />
      {state?.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post reply"}
      </Button>
    </form>
  );
}
