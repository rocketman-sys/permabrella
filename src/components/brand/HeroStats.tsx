import Link from "next/link";

function StatBlock({
  value,
  label,
  href,
  ariaLabel,
}: {
  value: number;
  label: string;
  href: string;
  ariaLabel: string;
}) {
  return (
    <div className="text-center">
      <Link
        href={href}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-surface)]"
        aria-label={ariaLabel}
      >
        <p className="pb-display text-[2rem] leading-none tracking-tight text-[var(--pb-primary)] transition group-hover:text-[var(--pb-primary-dk)] sm:text-[2.25rem] tabular-nums">
          {value}
        </p>
        <p className="pb-tag mt-2 text-[var(--pb-muted)]">{label}</p>
      </Link>
    </div>
  );
}

export function HeroStats({
  activeGrowers,
  landOffers,
  events,
}: {
  activeGrowers: number;
  landOffers: number;
  events: number;
}) {
  return (
    <div
      className="mt-8 border-t border-dashed border-[var(--pb-line)] pt-8"
      aria-label="Switchboard activity"
    >
      <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-10">
        <StatBlock
          value={activeGrowers}
          label="Community groups"
          href="/directory"
          ariaLabel={`${activeGrowers} community groups listed — open directory`}
        />
        <StatBlock
          value={landOffers}
          label="Land offers"
          href="/land-connect"
          ariaLabel={`${landOffers} land offers — open land connect`}
        />
        <StatBlock
          value={events}
          label="Events"
          href="/events"
          ariaLabel={`${events} events listed — open events`}
        />
      </div>
    </div>
  );
}
