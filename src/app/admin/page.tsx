import { Card } from "@/components/ui/Card";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">Admin</h1>
      <Card className="mt-6 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">Dashboard — coming later.</p>
      </Card>
    </div>
  );
}
