import { Card } from "@/components/ui/Card";

export default function DirectoryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Community groups
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Local organisations and collectives — directory entries will be curated here.
      </p>
      <Card className="mt-8 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">No directory entries yet.</p>
      </Card>
    </div>
  );
}
