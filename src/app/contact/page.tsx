import type { Metadata } from "next";
import { EnquiryForm } from "@/components/network/EnquiryForm";
import { ComingSoon, NetworkLayout, networkCard } from "@/components/network/NetworkLayout";

export const metadata: Metadata = { title: "Contact the PermaBrella team", description: "Ask about the developing network, membership, equipment library or ways to contribute. Enquiries are open while coordinator support is being established." };

export default function ContactPage() {
  return <NetworkLayout>
    <section className={networkCard} aria-labelledby="contact-heading"><p className="pb-tag text-[var(--pb-accent-2)]">Let’s grow connections</p><h1 id="contact-heading" className="pb-display mt-3 text-3xl sm:text-4xl">Contact the PermaBrella team.</h1><p className="mt-4 max-w-3xl text-lg text-[var(--pb-ink-soft)]">Have a question about the network, shared equipment or how your group could get involved? Leave an enquiry for the team.</p><div className="mt-5 rounded-lg bg-[var(--pb-bg)] p-4"><ComingSoon /><h2 className="mt-3 font-semibold">Dedicated coordinator support</h2><p className="mt-2 text-[var(--pb-ink-soft)]">The coordinator service is being established. Enquiries can be submitted now, but a response may take some time. Equipment bookings and membership approvals are not yet available.</p></div></section>
    <section className={`${networkCard} mt-7`} aria-labelledby="enquiry-heading"><h2 id="enquiry-heading" className="pb-display mb-6 text-2xl">How can we help?</h2><EnquiryForm kind="contact" /></section>
  </NetworkLayout>;
}
