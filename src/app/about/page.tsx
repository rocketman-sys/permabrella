import type { Metadata } from "next";
import Link from "next/link";
import { ROOTS_RIVERS_GROUP_ID } from "@/lib/posts/featured-groups";
import { ComingSoon, NetworkLayout, networkButton, networkCard, networkLink } from "@/components/network/NetworkLayout";

export const metadata: Metadata = { title: "Our network and partners", description: "Meet the organisations helping establish PermaBrella’s Northern Rivers food and farming network, and learn what is available now and what is coming soon." };

const partners = [
  { name: "Roots & Rivers Collective", role: "Founding partner of PermaBrella", description: "Bringing community organisers, permaculturalists and regenerative land practitioners together through gatherings, working bees and shared meals.", href: `/directory/${ROOTS_RIVERS_GROUP_ID}` },
  { name: "Ethos Global Foundation", role: "Grant applicant and project partner", description: "The applicant for the successful project grant, supporting the project’s governance, partnerships and long-term development." },
  { name: "SEED Northern Rivers", role: "Delivery partner and EcoHub host", description: "Supporting delivery of the developing network and hosting the planned equipment library at the Mullum Gardens EcoHub in Mullumbimby." },
  { name: "Know Nothing Pty Ltd", role: "Project co-funder", description: "Supporting the project’s staffing and programming through a co-contribution, helping build the network’s capacity to continue over time." },
];

export default function AboutPage() {
  return <NetworkLayout>
    <section className={networkCard} aria-labelledby="about-heading"><p className="pb-tag text-[var(--pb-accent-2)]">Northern Rivers food & farming network</p><h1 id="about-heading" className="pb-display mt-3 text-3xl sm:text-4xl">More connected people. A stronger local food system.</h1><p className="mt-4 max-w-3xl text-lg text-[var(--pb-ink-soft)]">PermaBrella connects the people, knowledge and resources that help our region grow food, care for land and support one another.</p><p className="mt-3 text-[var(--pb-ink-soft)]">Building on existing community groups and local knowledge, the next stage brings together shared equipment, practical learning and dedicated coordination. The initial project focuses on Byron, Ballina, Lismore, Richmond Valley and Kyogle, while the online hub welcomes connections across the Northern Rivers.</p></section>
    <section className="mt-9" aria-labelledby="partners-heading"><h2 id="partners-heading" className="pb-display text-2xl">The people and organisations behind the network</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{partners.map(partner => <article key={partner.name} className={networkCard}><p className="text-sm font-semibold text-[var(--pb-accent-2)]">{partner.role}</p><h3 className="pb-display mt-2 text-xl">{partner.name}</h3><p className="mt-3 text-[var(--pb-ink-soft)]">{partner.description}</p>{partner.href ? <Link href={partner.href} className={`${networkLink} mt-3`}>Meet Roots &amp; Rivers</Link> : null}</article>)}</div></section>
    <section className={`${networkCard} mt-8`} aria-labelledby="next-heading"><ComingSoon /><h2 id="next-heading" className="pb-display mt-3 text-2xl">Building the next chapter</h2><p className="mt-3 text-[var(--pb-ink-soft)]">The equipment library, formal membership, dedicated coordinator service and PermaBrella workshop programme are being developed. We’ll publish launch dates and access arrangements as they are confirmed.</p><p className="mt-3 text-[var(--pb-ink-soft)]">We’re working toward PermaBrella becoming an independent, self-sustaining not-for-profit organisation. Incorporation is a future milestone, and we’ll share progress as the organisation takes shape.</p><p className="mt-3 text-[var(--pb-ink-soft)]">A potential workshop collaboration with North Coast Local Land Services is being explored. Programme details and partner commitments will be shared once confirmed.</p><Link href="/join" className={`${networkButton} mt-5`}>Register your interest</Link></section>
    <p className="mt-6 text-[var(--pb-ink-soft)]">You can already <Link href="/directory" className={networkLink}>find a local group</Link>, <Link href="/events" className={networkLink}>browse community events</Link> and <Link href="/community" className={networkLink}>join the conversation</Link>.</p>
  </NetworkLayout>;
}
