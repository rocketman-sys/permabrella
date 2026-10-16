import Link from "next/link";
import type { posts } from "@/lib/db/schema";
import { listingFreshness } from "@/lib/posts/freshness";

export function GrantsClosingSoon({ grants, filtered }: {
  grants: (typeof posts.$inferSelect)[];
  filtered: boolean;
}) {
  return (
    <section id="closing-soon" aria-labelledby="closing-soon-heading" className="mt-7 rounded-xl border border-[var(--pb-line)] bg-[var(--pb-bg)] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="closing-soon-heading" className="pb-display text-2xl text-[var(--pb-ink)]">Grants closing soon</h2>
        <span className="rounded-full bg-[var(--pb-surface)] px-3 py-1 text-xs font-semibold text-[var(--pb-accent-2)]">Next 30 days</span>
      </div>
      <p className="mt-2 text-sm text-[var(--pb-ink-soft)]">Verified closing dates, soonest first. Dates and times are shown in NSW time.</p>
      {grants.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {grants.map((grant) => (
            <li key={grant.id}>
              <Link href={`/grants/${grant.id}`} className="block h-full rounded-lg border border-[var(--pb-line)] bg-[var(--pb-surface)] p-4 transition hover:border-[var(--pb-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pb-primary)]">
                <h3 className="font-semibold text-[var(--pb-primary)]">{grant.title}</h3>
                {typeof grant.metadata.funding === "string" ? <p className="mt-2 text-sm font-semibold">{grant.metadata.funding}</p> : null}
                <p className="mt-2 text-sm text-[var(--pb-ink-soft)]">{listingFreshness(grant).note}</p>
                {typeof grant.metadata.eligibilitySummary === "string" ? <p className="mt-3 text-xs leading-relaxed text-[var(--pb-ink-soft)]">{grant.metadata.eligibilitySummary}</p> : null}
                <span className="mt-3 inline-block text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">View grant details <span aria-hidden="true">→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-lg bg-[var(--pb-surface)] p-4 text-sm text-[var(--pb-ink-soft)]">
          <p>No verified grant deadlines in the next 30 days{filtered ? " for this region" : ""}. Browse the other listings below for later rounds and ongoing support.</p>
          {filtered ? <Link href="/grants#closing-soon" className="mt-2 inline-flex min-h-11 items-center font-semibold text-[var(--pb-accent-2)] underline">Show all regions</Link> : null}
        </div>
      )}
    </section>
  );
}
