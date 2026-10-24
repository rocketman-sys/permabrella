"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitNetworkEnquiry } from "@/app/join/actions";
import { COUNCIL_AREAS, NETWORK_INTERESTS, type EnquiryKind } from "@/lib/network/options";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const field = "w-full rounded-lg border border-[var(--pb-line)] bg-white px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--pb-accent-2)]";

export function EnquiryForm({ kind }: { kind: EnquiryKind }) {
  const [state, action, pending] = useActionState(submitNetworkEnquiry, { success: false });
  // Controlled fields preserve the visitor's work when a Server Action returns an error.
  const [values, setValues] = useState({ name: "", email: "", area: "", message: "", interests: [] as string[], consent: false });
  const notice = useRef<HTMLDivElement>(null);
  useEffect(() => { if (state.success || state.error) notice.current?.focus(); }, [state]);

  if (state.success) return (
    <div ref={notice} tabIndex={-1} role="status" className="rounded-xl border border-[var(--pb-accent-2)] bg-[var(--pb-surface)] p-6 focus:outline-none">
      <h2 className="pb-display text-2xl">{kind === "membership" ? "Your interest is registered." : "Your enquiry is saved."}</h2>
      <p className="mt-3 text-[var(--pb-ink-soft)]">{kind === "membership" ? "Thank you for helping shape PermaBrella. Your details are in the team’s private inbox so we can contact you as membership takes shape. This is an expression of interest, not a membership or equipment booking." : "Thank you. Your message is in the PermaBrella team’s private inbox. Coordinator support is still being established, so a response may take some time."}</p>
    </div>
  );

  return (
    <form action={action} className="space-y-5 [&_input]:scroll-mt-16 [&_select]:scroll-mt-16 [&_textarea]:scroll-mt-16" aria-label={kind === "membership" ? "Membership expression of interest" : "Contact the PermaBrella team"}>
      <input type="hidden" name="kind" value={kind} />
      <div hidden aria-hidden="true"><label htmlFor={`${kind}-website`}>Leave this blank</label><input id={`${kind}-website`} name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor={`${kind}-name`} className="mb-2 block font-semibold">Name <span className="font-normal">(required)</span></label><Input id={`${kind}-name`} name="name" value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} required maxLength={150} autoComplete="name" className="min-h-11 text-base" /></div>
        <div><label htmlFor={`${kind}-email`} className="mb-2 block font-semibold">Email <span className="font-normal">(required)</span></label><Input id={`${kind}-email`} name="email" value={values.email} onChange={event => setValues({ ...values, email: event.target.value })} type="email" required maxLength={254} autoComplete="email" className="min-h-11 text-base" /></div>
      </div>
      <div><label htmlFor={`${kind}-area`} className="mb-2 block font-semibold">Council area <span className="font-normal">({kind === "membership" ? "required" : "optional"})</span></label><select id={`${kind}-area`} name="area" value={values.area} onChange={event => setValues({ ...values, area: event.target.value })} required={kind === "membership"} className={field}><option value="">Choose your area</option>{COUNCIL_AREAS.map(area => <option key={area}>{area}</option>)}</select></div>
      {kind === "membership" ? <fieldset><legend className="mb-2 font-semibold">What interests you? <span className="font-normal">(optional)</span></legend><div className="grid gap-2 sm:grid-cols-2">{NETWORK_INTERESTS.map(interest => <label key={interest} className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--pb-line)] p-3"><input type="checkbox" name="interests" value={interest} checked={values.interests.includes(interest)} onChange={event => setValues({ ...values, interests: event.target.checked ? [...values.interests, interest] : values.interests.filter(x => x !== interest) })} className="h-5 w-5 shrink-0 accent-[var(--pb-accent-2)]" />{interest}</label>)}</div></fieldset> : null}
      <div><label htmlFor={`${kind}-message`} className="mb-2 block font-semibold">{kind === "membership" ? "Anything you’d like to share? (optional)" : "How can we help? (required)"}</label><textarea id={`${kind}-message`} name="message" value={values.message} onChange={event => setValues({ ...values, message: event.target.value })} required={kind === "contact"} maxLength={2000} rows={5} className={field} aria-describedby={`${kind}-message-help`} /><p id={`${kind}-message-help`} className="mt-1 text-sm text-[var(--pb-muted)]">Up to 2,000 characters. Please leave out sensitive personal information.</p></div>
      <div id="your-details" className="rounded-lg bg-[var(--pb-bg)] p-4 text-sm text-[var(--pb-ink-soft)]"><h3 className="font-semibold text-[var(--pb-ink)]">Your details stay private</h3><p className="mt-2">Only authorised PermaBrella site administrators can read these submissions. We use your details to respond to your enquiry{kind === "membership" ? " and contact you about membership and your selected interests" : ""}. They are not published in the directory or discussions, and submitting this form does not create a website account. You can ask the team to update or remove your details through the contact form.</p></div>
      <label className="flex items-start gap-3"><input type="checkbox" name="consent" value="yes" checked={values.consent} onChange={event => setValues({ ...values, consent: event.target.checked })} required className="mt-1 h-5 w-5 shrink-0 accent-[var(--pb-accent-2)]" /><span className="text-sm">I agree that the PermaBrella team can store my details and contact me for these purposes. <span className="font-semibold">(Required)</span></span></label>
      {state.error ? <div ref={notice} tabIndex={-1} role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">{state.error}</div> : null}
      <Button type="submit" disabled={pending} className="min-h-12 w-full px-6 text-base sm:w-auto">{pending ? "Saving…" : kind === "membership" ? "Register my interest" : "Send enquiry"}</Button>
    </form>
  );
}
