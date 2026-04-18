import { Card } from "@/components/ui/Card";

export default function ModerationPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">Moderation</h1>
      <Card className="mt-6 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">Queue — coming later.</p>
      </Card>
    </div>
  );
}
