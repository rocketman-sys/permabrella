import support from "../../../data/conservation-support.json";
import { formatPosted } from "@/lib/posts/format";

export function ConservationSupport() {
  return (
    <section id="conservation-support" aria-labelledby="conservation-support-heading" className="mt-10 scroll-mt-6 rounded-xl border border-[var(--pb-line)] bg-[var(--pb-bg)] p-4 sm:p-6">
      <h2 id="conservation-support-heading" className="pb-display text-2xl text-[var(--pb-ink)]">Conservation programs &amp; support</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--pb-ink-soft)]">Practical support and conservation pathways for NSW landholders. Each has different commitments and funding arrangements. Participation does not guarantee eligibility for other grants or a successful application.</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a href={support.comparisonUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">Compare NSW conservation agreements</a>
        <p className="text-xs text-[var(--pb-muted)]">Sources checked <time dateTime={support.checkedDate}>{formatPosted(new Date(support.checkedDate))}</time></p>
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {support.programs.map((program) => (
          <li key={program.id} className="flex flex-col rounded-lg border border-[var(--pb-line)] bg-[var(--pb-surface)] p-4 sm:p-5">
            <p className="text-xs font-semibold text-[var(--pb-accent-2)]">{program.kind}</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--pb-primary)]">{program.title}</h3>
            <p className="mt-3 text-sm leading-relaxed">{program.summary}</p>
            <p className="mt-3 text-sm leading-relaxed"><strong>Commitment:</strong> {program.commitment}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--pb-ink-soft)]"><strong>Funding:</strong> {program.funding}</p>
            {program.contacts ? <details className="mt-3 text-sm">
              <summary className="cursor-pointer py-3 font-semibold text-[var(--pb-accent-2)]">Local Land for Wildlife contacts</summary>
              <ul className="space-y-4 pt-2">
                {program.contacts.map((contact) => <li key={contact.area} className="break-words">
                  <p className="font-semibold">{contact.area}</p>
                  <a href={contact.url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 underline underline-offset-4">{contact.name}</a>
                  <p><a className="inline-block break-all py-2 underline" href={`mailto:${contact.email}`}>{contact.email}</a></p>
                  <p><a className="inline-block py-2 underline" href={`tel:${contact.tel}`}>{contact.phone}</a></p>
                </li>)}
              </ul>
              <p className="mt-3 text-[var(--pb-ink-soft)]">For other areas, use the NSW regional provider directory below.</p>
            </details> : null}
            <div className="mt-auto flex flex-col items-start gap-1 pt-3">
              {program.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">{link.label}</a>)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
