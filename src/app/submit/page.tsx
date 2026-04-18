import Link from "next/link";
import { Card } from "@/components/ui/Card";

const options = [
  { href: "/events/new", label: "Submit an event or workshop" },
  { href: "/offerings/new", label: "Post an offering or want" },
  { href: "/land-connect/new", label: "List land or ask for land" },
  { href: "/community/new", label: "Start a community Q&A thread" },
];

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Post to the switchboard
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Choose what you would like to share. Forms are stubs in this phase — navigation
        and structure are in place for the next build steps.
      </p>
      <ul className="mt-8 space-y-3">
        {options.map((o) => (
          <li key={o.href}>
            <Link href={o.href} className="block">
              <Card className="transition hover:border-[var(--perm-secondary)]/50 hover:shadow-md">
                <span className="font-medium text-[var(--perm-primary)]">{o.label}</span>
                <span className="mt-1 block text-sm text-[var(--perm-muted)]">
                  Opens submission form (coming soon)
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
