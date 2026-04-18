"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { REGIONS } from "@/lib/regions";
import type { topics } from "@/lib/db/schema";
import {
  createThreadAction,
  type CommunityFormState,
} from "@/app/community/actions";

type Topic = typeof topics.$inferSelect;

export function NewThreadForm({
  topicsList,
  defaultTopicSlug,
}: {
  topicsList: Topic[];
  defaultTopicSlug?: string;
}) {
  const [state, formAction, pending] = useActionState<
    CommunityFormState,
    FormData
  >(createThreadAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="topicSlug" className="text-sm font-medium text-[var(--perm-text)]">
          Topic
        </label>
        <Select
          id="topicSlug"
          name="topicSlug"
          required
          className="mt-1"
          defaultValue={defaultTopicSlug && topicsList.some((t) => t.slug === defaultTopicSlug)
            ? defaultTopicSlug
            : topicsList[0]?.slug}
        >
          {topicsList.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="title" className="text-sm font-medium text-[var(--perm-text)]">
          Title
        </label>
        <Input id="title" name="title" required className="mt-1" />
      </div>
      <div>
        <label htmlFor="body" className="text-sm font-medium text-[var(--perm-text)]">
          Question or context
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={8}
          className="mt-1 w-full rounded-lg border border-[var(--perm-border)] bg-white px-3 py-2 text-[var(--perm-text)] placeholder:text-[var(--perm-muted)] focus:border-[var(--perm-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--perm-secondary)]/30"
        />
      </div>
      <div>
        <label htmlFor="region" className="text-sm font-medium text-[var(--perm-text)]">
          Region (optional)
        </label>
        <Select id="region" name="region" className="mt-1">
          <option value="">—</option>
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>
      {state?.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Publishing…" : "Start thread"}
      </Button>
    </form>
  );
}
