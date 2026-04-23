import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageHeroBar } from "@/components/layout/PageHeroBar";

const options: { href: string; label: string; note: string }[] = [
  { href: "/events/new", label: "Event or workshop", note: "Live — sign in to publish" },
  {
    href: "/directory/new",
    label: "Community group",
    note: "Live — sign in to publish",
  },
  { href: "/grants/new", label: "Grant or funding round", note: "Live — sign in to publish" },
  {
    href: "/offerings/new",
    label: "Offerings, Wants & Exchange",
    note: "Live — sign in to publish",
  },
  { href: "/land-connect/new", label: "Land listing", note: "Live — sign in to publish" },
  { href: "/community/new", label: "Q&A thread", note: "Live — sign in to post" },
];

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeroBar
        title="Post to the switchboard"
        subtitle="Choose what you would like to share. Events, groups, grants, exchange listings, land listings, and community Q&A are all live. Everything here is visible to everyone — you only need to sign in when you are ready to publish."
      />
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
