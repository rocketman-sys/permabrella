import Link from "next/link";

type CommunityStats = {
  communityGroups: number;
  discussions: number;
  events: number;
  grants: number;
};

const counters = [
  { key: "communityGroups", label: "Community groups", href: "/directory" },
  { key: "discussions", label: "Discussions", href: "/community" },
  { key: "events", label: "Events listed", href: "/events" },
  { key: "grants", label: "Grant listings", href: "/grants" },
] as const;

export function HeroStats({ stats }: { stats?: CommunityStats }) {
  return (
    <section
      className="mt-6 border-t border-dashed border-[var(--pb-line)] pt-5"
      aria-label="Community at a glance"
      aria-busy={!stats}
    >
      <p className="mb-3 text-center text-xs text-[var(--pb-ink-soft)]">
        Across the Northern Rivers
        {!stats ? <span className="sr-only"> — loading community totals</span> : null}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
        {counters.map(({ key, label, href }) => (
          <Link
            key={key}
            href={href}
            className="group rounded-md px-1 py-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-surface)]"
            aria-label={`${stats ? `${stats[key].toLocaleString("en-AU")} ` : ""}${label.toLowerCase()} — browse`}
          >
            <p className="pb-display text-[2rem] leading-none tracking-tight text-[var(--pb-primary)] transition group-hover:text-[var(--pb-primary-dk)] sm:text-[2.25rem] tabular-nums">
              {stats ? stats[key].toLocaleString("en-AU") : "—"}
            </p>
            <p className="pb-tag mt-2 min-h-8 text-[var(--pb-muted)]">{label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
