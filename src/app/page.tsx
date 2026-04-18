import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { FeedTimeline } from "@/components/feed/FeedTimeline";
import { RegionFilter } from "@/components/layout/RegionFilter";

const panels = [
  {
    href: "/events",
    title: "Events & workshops",
    blurb: "Skill shares, working bees, and food security gatherings.",
  },
  {
    href: "/offerings",
    title: "Offerings & wants",
    blurb: "Share surplus, tools, seeds, and what you are looking for.",
  },
  {
    href: "/land-connect",
    title: "Land connect",
    blurb: "Match landholders with growers who want to cultivate.",
  },
  {
    href: "/directory",
    title: "Community groups",
    blurb: "Find local organisations already on the ground.",
  },
  {
    href: "/community",
    title: "Community Q&A",
    blurb: "Ask and answer practical growing questions by topic.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl border border-[var(--perm-border)] bg-[var(--perm-card)] px-6 py-10 shadow-sm sm:px-10">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--perm-secondary)]">
          Northern Rivers, NSW
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--perm-primary)] sm:text-4xl">
          Permabrella — food security switchboard
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-[var(--perm-text-secondary)]">
          Connect growers with land, surface local events and offerings, and share
          knowledge so our communities stay fed and resilient.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/submit"
            className="inline-flex rounded-lg bg-[var(--perm-earth)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Post to the switchboard
          </Link>
          <Link
            href="/community"
            className="inline-flex rounded-lg border border-[var(--perm-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--perm-primary)] hover:bg-[var(--perm-bg)]"
          >
            Browse Q&amp;A
          </Link>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--perm-primary)]">
            Region
          </h2>
          <p className="text-sm text-[var(--perm-muted)]">
            Narrow what you see to your area (more filters coming soon).
          </p>
        </div>
        <div className="w-full max-w-xs">
          <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
            <RegionFilter id="home-region" />
          </Suspense>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="panels-heading">
        <h2 id="panels-heading" className="text-lg font-semibold text-[var(--perm-primary)]">
          Quick access
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {panels.map((p) => (
            <Link key={p.href} href={p.href} className="group block">
              <Card className="h-full transition group-hover:border-[var(--perm-secondary)]/50 group-hover:shadow-md">
                <h3 className="font-medium text-[var(--perm-primary)] group-hover:text-[var(--perm-secondary)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--perm-text-secondary)]">
                  {p.blurb}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-[var(--perm-primary)]">
          Recent activity
        </h2>
        <div className="mt-4">
          <FeedTimeline />
        </div>
      </section>
    </div>
  );
}
