import type { Metadata } from "next";
import Link from "next/link";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "PermaBrella’s vision: a regional switchboard for food security, exchange, and resilience — an evolving node in the Northern Rivers communal fabric.",
};

const linkCta =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--pb-primary-dk)]";

const linkGhost =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--pb-r-sm)] border border-[var(--pb-line)] bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--pb-ink)] transition hover:bg-[var(--pb-bg)]";

const prose =
  "space-y-4 text-base leading-relaxed text-[var(--pb-ink-soft)] md:text-[17px]";

const h2 =
  "mt-12 text-xl font-bold tracking-tight text-[var(--pb-ink)] md:text-lg";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5 md:py-10">
      <PageHeroBar
        title="How it works"
        subtitle="PermaBrella is a living regional switchboard — not a catalogue of noise, but a connective layer for practical action in the Northern Rivers."
        actions={
          <>
            <Link href="/submit" className={linkCta}>
              Post to the switchboard
            </Link>
            <Link href="/" className={linkGhost}>
              Back to home
            </Link>
          </>
        }
      />

      <div className={prose}>
        <h2 className={h2}>The vision</h2>
        <p>
          We are building toward a region that grows more food, shares more
          generously, and weathers disruption with stronger local relationships.
          PermaBrella exists to help people, land, skills, tools, events, and
          knowledge find each other — so dormant capacity can become active
          capacity.
        </p>
        <p>
          Success is not measured by how much content sits on the site. It is
          measured by what happens in gardens, halls, working bees, seed swaps,
          and neighbourly exchange when the right connections are easier to
          make.
        </p>

        <h2 className={h2}>A hub in the communal fabric</h2>
        <p>
          Healthy communities are woven from many nodes: community gardens,
          groups, blitz crews, land shares, workshops, and informal networks.
          PermaBrella does not replace those nodes. It aims to be one{" "}
          <strong className="font-semibold text-[var(--pb-ink)]">
            evolving networking hub
          </strong>{" "}
          — a place where signals cross: who needs help, who has surplus, what
          is on, where land or skills might meet.
        </p>
        <p>
          Like mycelium under the forest floor, the value is in linkage and
          circulation, not in owning the whole landscape. The site will grow and
          change as the region uses it; your listings, questions, and
          participation are what keep the fabric alive.
        </p>

        <h2 className={h2}>What you can do here</h2>
        <p>
          Each area of the hub supports a different kind of matchmaking. Browse
          or post as it fits your situation:
        </p>
      </div>

      <ul className="mt-4 space-y-3 text-base text-[var(--pb-ink-soft)] md:text-[17px]">
        <li>
          <Link
            href="/events"
            className="font-semibold text-[var(--pb-primary)] hover:underline"
          >
            Events &amp; workshops
          </Link>
          {" — "}skill shares, working bees, and gatherings you can join or
          list.
        </li>
        <li>
          <Link
            href="/offerings"
            className="font-semibold text-[var(--pb-primary)] hover:underline"
          >
            Offerings, Wants &amp; Exchange
          </Link>
          {" — "}surplus, tools, seeds, and requests in one circulation loop.
        </li>
        <li>
          <Link
            href="/land-connect"
            className="font-semibold text-[var(--pb-primary)] hover:underline"
          >
            Land connect
          </Link>
          {" — "}landholders and growers finding fit with clarity and care.
        </li>
        <li>
          <Link
            href="/directory"
            className="font-semibold text-[var(--pb-primary)] hover:underline"
          >
            Community groups
          </Link>
          {" — "}organisations already on the ground, so newcomers can plug in.
        </li>
        <li>
          <Link
            href="/grants"
            className="font-semibold text-[var(--pb-primary)] hover:underline"
          >
            Community grants
          </Link>
          {" — "}funding and programs that support local resilience.
        </li>
        <li>
          <Link
            href="/community"
            className="font-semibold text-[var(--pb-primary)] hover:underline"
          >
            Community Q&amp;A
          </Link>
          {" — "}practical questions by topic; human knowledge first, with
          AI-assisted replies clearly marked where used.
        </li>
      </ul>

      <div className={`${prose} mt-8`}>
        <h2 className={h2}>Trust and clarity</h2>
        <p>
          We care that you can see what something is, who it is for, and what to
          do next. Where AI helps with synthesis or drafting, we aim to keep
          that visible so human observation and local judgment stay primary —
          especially for land, weather, plants, and place.
        </p>
      </div>

      <Card className="mt-10 border-[var(--pb-line)] bg-[color-mix(in_srgb,var(--pb-bg-alt)_40%,var(--pb-surface))]">
        <p className="text-base font-medium text-[var(--pb-ink)] md:text-[17px]">
          Ready to add a signal to the network?
        </p>
        <p className="mt-2 text-base text-[var(--pb-ink-soft)] md:text-[17px]">
          Listings are public; sign in when you post so we can keep the
          switchboard accountable and useful.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/submit" className={linkCta}>
            Choose a listing type
          </Link>
          <Link href="/search" className={linkGhost}>
            Search the hub
          </Link>
        </div>
      </Card>
    </div>
  );
}
