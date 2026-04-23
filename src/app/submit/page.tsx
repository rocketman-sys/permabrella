import Link from "next/link";
import { Card } from "@/components/ui/Card";

const options: { href: string; label: string; note: string }[] = [
  { href: "/events/new", label: "Event or workshop", note: "Live — sign in to publish" },
  {
    href: "/directory/new",
    label: "Community group",
    note: "Live — sign in to publish",
  },
  { href: "/grants/new", label: "Grant or funding round", note: "Live — sign in to publish" },
  { href: "/offerings/new", label: "Offering or want", note: "Coming in Phase 4" },
  { href: "/land-connect/new", label: "Land listing", note: "Coming in Phase 5" },
  { href: "/community/new", label: "Q&A thread", note: "Live — sign in to post" },
];

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Post to the switchboard
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Choose what you would like to share. Events, directory, grants, and community Q&amp;A are
        live; other panels are on the roadmap. Everything here is visible to everyone — you only
        need to sign in when you are ready to publish.
      </p>
      <ul className="mt-8 space-y-3">
        {options.map((o) => (
          <li key={o.href}>
            <Link href={o.href} className="block">
              <Card className="transition hover:border-[var(--perm-secondary)]/50 hover:shadow-md">
                <span className="font-medium text-[var(--perm-primary)]">{o.label}</span>
                <span className="mt-1 block text-sm text-[var(--perm-muted)]">{o.note}</span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
