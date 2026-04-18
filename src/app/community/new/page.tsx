import { Card } from "@/components/ui/Card";

export default function NewThreadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">Start a thread</h1>
      <Card className="mt-6 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">Thread composer coming in Phase 3.</p>
      </Card>
    </div>
  );
}
