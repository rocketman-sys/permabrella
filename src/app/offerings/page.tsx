import { Card } from "@/components/ui/Card";

export default function OfferingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Offerings &amp; wants
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Classifieds for surplus, tools, seeds, and requests.
      </p>
      <Card className="mt-8 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">No listings yet.</p>
      </Card>
    </div>
  );
}
