import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/network/EnquiryForm";
import { ComingSoon, NetworkLayout, networkCard, networkLink } from "@/components/network/NetworkLayout";

export const metadata: Metadata = { title: "Membership interest", description: "Help shape the PermaBrella food and farming network. Register your interest in membership, shared equipment, workshops and local connections." };

export default function JoinPage() {
  return <NetworkLayout>
    <section className={networkCard} aria-labelledby="join-heading"><ComingSoon /><h1 id="join-heading" className="pb-display mt-4 text-3xl sm:text-4xl">Help grow the PermaBrella network.</h1><p className="mt-4 max-w-3xl text-lg text-[var(--pb-ink-soft)]">Backyard grower, landholder, small-scale farmer, community group or simply keen to get involved — there’s a place for your interest here.</p><p className="mt-3 text-[var(--pb-ink-soft)]">Formal membership is coming soon. We’re developing shared equipment access, practical learning and local connections, with an initial focus on Byron, Ballina, Lismore, Richmond Valley and Kyogle.</p><p className="mt-4 font-semibold">Expressions of interest are open now. There is no fee or commitment to register interest. Membership terms, fees and the opening date are still being developed.</p></section>
    <section className={`${networkCard} mt-7`} aria-labelledby="interest-heading"><h2 id="interest-heading" className="pb-display text-2xl">Tell us what you’re interested in</h2><p className="mb-6 mt-2 text-[var(--pb-ink-soft)]">The team can contact you as the programme takes shape. No website account is needed.</p><EnquiryForm kind="membership" /></section>
    <p className="mt-6 text-sm text-[var(--pb-ink-soft)]">Ready to take part online today? <Link href="/register" className={networkLink}>Create a free website account</Link> to post listings and join discussions. A website account is separate from future network membership.</p>
  </NetworkLayout>;
}
