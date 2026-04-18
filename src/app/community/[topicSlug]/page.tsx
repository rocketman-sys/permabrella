import { Card } from "@/components/ui/Card";

export default async function TopicThreadsPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)] capitalize">
        {topicSlug.replace(/-/g, " ")}
      </h1>
      <Card className="mt-6 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">Thread list — coming soon.</p>
      </Card>
    </div>
  );
}
