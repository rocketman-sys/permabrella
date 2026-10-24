import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon, NetworkLayout, networkButton, networkCard, networkLink } from "@/components/network/NetworkLayout";

export const metadata: Metadata = { title: "Shared equipment — coming soon", description: "Discover PermaBrella’s planned shared equipment library for food growers across five Northern Rivers council areas. Register your interest while access is being established." };

const equipment = [
  { name: "Hand-E T electric tractor", detail: "A shared electric tool carrier to help community growers with practical land and garden work." },
  { name: "Growing and land-care implements", detail: "The planned library includes a flail mower, slasher, power harrow and auger, with suitable tasks explained during induction." },
  { name: "Transport trailer", detail: "A trailer is planned to help equipment reach member sites across the region. Transport arrangements are still being developed." },
];

export default function EquipmentPage() {
  return <NetworkLayout>
    <section className={networkCard} aria-labelledby="equipment-heading">
      <ComingSoon />
      <h1 id="equipment-heading" className="pb-display mt-4 text-3xl sm:text-4xl">Shared tools. More food grown locally.</h1>
      <p className="mt-4 max-w-3xl text-lg text-[var(--pb-ink-soft)]">We’re establishing a shared equipment library so more people can grow food without having to buy costly machinery themselves.</p>
      <p className="mt-3 max-w-3xl text-[var(--pb-ink-soft)]">The planned base is the Mullum Gardens EcoHub in Mullumbimby, with access being developed for growers and community groups across Byron, Ballina, Lismore, Richmond Valley and Kyogle.</p>
      <p className="mt-4 font-semibold">Equipment loans and bookings are not open yet. Launch dates, fees and collection arrangements will be published when confirmed.</p>
      <Link href="/join" className={`${networkButton} mt-5`}>Register interest in equipment access</Link>
    </section>
    <section className="mt-9" aria-labelledby="planned-equipment"><h2 id="planned-equipment" className="pb-display text-2xl">What’s planned for the library</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{equipment.map(item => <article key={item.name} className={networkCard}><ComingSoon /><h3 className="pb-display mt-4 text-xl">{item.name}</h3><p className="mt-3 text-[var(--pb-ink-soft)]">{item.detail}</p></article>)}</div></section>
    <section className={`${networkCard} mt-8`} aria-labelledby="access-heading"><h2 id="access-heading" className="pb-display text-2xl">How access is being developed</h2><ol className="mt-4 list-decimal space-y-3 pl-5 text-[var(--pb-ink-soft)]"><li><strong className="text-[var(--pb-ink)]">Register your interest now.</strong> Tell us your area and what you’d like to grow or contribute.</li><li><strong className="text-[var(--pb-ink)]">Membership and induction — coming soon.</strong> Equipment access will require a completed safety induction. Towing the trailer will require a separate transport induction.</li><li><strong className="text-[var(--pb-ink)]">Booking and collection — coming soon.</strong> The team will confirm availability, suitability and arrangements before equipment is released.</li></ol><p className="mt-4 text-sm text-[var(--pb-ink-soft)]">Registering interest does not reserve equipment or approve you to use it.</p></section>
    <div className="mt-7 flex flex-wrap gap-x-6"><Link href="/contact" className={networkLink}>Ask the team a question</Link><Link href="/events" className={networkLink}>Explore current community events</Link></div>
  </NetworkLayout>;
}
