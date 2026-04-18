import { Card } from "@/components/ui/Card";

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Events &amp; workshops
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Listings and external feeds will land here in the next phase.
      </p>
      <Card className="mt-8 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">No events yet.</p>
      </Card>
    </div>
  );
}
