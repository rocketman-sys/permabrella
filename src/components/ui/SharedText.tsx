import { sharedTextParts } from '@/lib/shared-text';

/** Use only for strings outside an existing anchor; React escapes all content. */
export function SharedText({ text, maxLength }: { text: string; maxLength?: number }) {
  return <span className="[overflow-wrap:anywhere]">{sharedTextParts(text, maxLength).map((part, i) => part.href
    ? <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className="relative z-10 rounded-sm font-medium text-[var(--pb-accent-2)] underline decoration-1 underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pb-accent-2)]">{part.text}<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a>
    : part.text)}</span>;
}
