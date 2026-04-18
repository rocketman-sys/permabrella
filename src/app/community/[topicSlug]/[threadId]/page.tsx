import { Card } from "@/components/ui/Card";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ topicSlug: string; threadId: string }>;
}) {
  const { topicSlug, threadId } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-[var(--perm-muted)]">
        Topic: <span className="font-medium text-[var(--perm-text)]">{topicSlug}</span>
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--perm-primary)]">Thread</h1>
      <Card className="mt-4 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">
          Thread <code className="rounded bg-[var(--perm-bg)] px-1">{threadId}</code> — coming soon.
        </p>
      </Card>
    </div>
  );
}
