import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">Admin</h1>
      <Card className="mt-6">
        <Link href="/admin/enquiries" className="inline-flex min-h-11 items-center font-semibold text-[var(--pb-accent-2)] underline">Network enquiries</Link>
        <p className="mt-2 text-sm text-[var(--perm-muted)]">Membership expressions of interest and team contact enquiries. Site administrator access is required.</p>
      </Card>
    </div>
  );
}
