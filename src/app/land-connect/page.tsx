import { Card } from "@/components/ui/Card";

export default function LandConnectPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">Land connect</h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Match landholders with growers — moderated listings will appear here.
      </p>
      <Card className="mt-8 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">No land listings yet.</p>
      </Card>
    </div>
  );
}
