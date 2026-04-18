import { Card } from "@/components/ui/Card";

export default async function OfferingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">Listing</h1>
      <Card className="mt-4 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">
          Listing <code className="rounded bg-[var(--perm-bg)] px-1">{id}</code> — coming soon.
        </p>
      </Card>
    </div>
  );
}
