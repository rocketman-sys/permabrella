'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { HelperCategory, HelperKind, HelperReply } from '@/lib/helper/policy';

type Turn = { question: string; reply: HelperReply };
const control = 'min-h-11 rounded-xl border border-[var(--perm-border)] bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--perm-primary)]';

export function HelperPreview({ aiEnabled }: { aiEnabled: boolean }) {
  const [kind, setKind] = useState<HelperKind>('site');
  const [category, setCategory] = useState<HelperCategory>('all');
  const [query, setQuery] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const latest = useRef<HTMLElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (panel.current && latest.current) panel.current.scrollTop = latest.current.offsetTop; }, [turns]);
  useEffect(() => { if (!pending && turns.length) input.current?.focus({ preventScroll: true }); }, [pending, turns.length]);

  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending || query.trim().length < 2) return;
    const question = query.trim(); setPending(true); setError('');
    controller.current = new AbortController();
    const timer = setTimeout(() => controller.current?.abort(), 25_000);
    try {
      const res = await fetch('/api/helper-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, kind, category }), signal: controller.current.signal });
      const data = await res.json();
      if (!res.ok) throw Error(typeof data.error === 'string' ? data.error : 'Please try again.');
      setTurns(old => [...old.slice(-5), { question, reply: data as HelperReply }]); setQuery('');
    } catch (err) { setError(err instanceof Error && err.name === 'AbortError' ? 'The request took too long. Please try again.' : err instanceof Error ? err.message : 'Please try again.'); }
    finally { clearTimeout(timer); setPending(false); }
  }

  return <section className="overflow-hidden rounded-3xl border border-[var(--perm-border)] bg-[var(--perm-card)] shadow-sm" aria-label="PermaBrella helper preview">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--perm-border)] px-5 py-4">
      <div><h2 className="text-xl font-bold text-[var(--perm-primary)]">A little help finding your people</h2>
        <p className="mt-1 text-sm text-[var(--perm-muted)]">{aiEnabled ? 'AI evaluation preview · sign-in required' : 'Review preview · live search, AI off'}</p></div>
      <button type="button" className={control} disabled={pending || !turns.length} onClick={() => { setTurns([]); setQuery(''); setError(''); input.current?.focus(); }}>Clear chat</button>
    </div>
    <div ref={panel} className="relative max-h-[65vh] min-h-56 overflow-y-auto p-5 sm:p-6" aria-busy={pending}>
      {!turns.length && <div className="py-4"><p className="max-w-lg text-lg leading-relaxed">Find local groups, workshops, land connections and funding opportunities. Every local result links back to its listing.</p>
        <p className="mt-3 text-sm text-[var(--perm-muted)]">Try a name, town or activity. Each question starts fresh; this preview does not remember earlier questions.</p>
        <div className="mt-5 flex flex-wrap gap-2">{['Mullumbimby garden', 'SEED Northern Rivers', 'Nimbin events'].map(q => <button key={q} type="button" className={`${control} text-[var(--perm-primary)]`} onClick={() => { setKind('site'); setCategory('all'); setQuery(q); input.current?.focus(); }}>{q}</button>)}</div>
      </div>}
      <div className="space-y-7">{turns.map(({ question, reply }, index) => <article key={index} ref={index === turns.length - 1 ? latest : null} className="min-w-0 [overflow-wrap:anywhere]">
        <p className="ml-auto max-w-[90%] rounded-2xl bg-[var(--perm-primary)] px-4 py-3 text-white">{question}</p>
        <div className="mt-4"><p className="text-xs font-bold uppercase tracking-wide text-[var(--perm-secondary)]">{reply.kind === 'general' ? 'General guidance · not locally verified' : reply.generated ? 'From PermaBrella · AI summary' : 'From PermaBrella · live lookup'}</p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed">{reply.answer}</p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--perm-muted)]">{reply.notice}</p>
          <ol className="mt-4 space-y-3">{reply.sources.map((source, i) => <li key={source.id} className="rounded-2xl border border-[var(--perm-border)] bg-white p-4">
            <Link href={source.href} className="inline-block min-h-11 text-lg font-bold text-[var(--perm-primary)] underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">[{i + 1}] {source.title}</Link>
            {source.region && <p className="text-xs font-semibold uppercase tracking-wide text-[var(--perm-muted)]">{source.region}</p>}
            <p className="mt-2 text-sm leading-relaxed">{source.excerpt}</p>
            <p className="mt-3 text-xs font-semibold">{source.verification}</p>
            <p className="mt-1 text-xs">{source.freshness}</p>
            {source.note && <p className="mt-2 text-xs leading-relaxed text-[var(--perm-muted)]">{source.note}</p>}
            <details className="mt-3 text-xs"><summary className="min-h-11 cursor-pointer py-3 font-semibold">Source links and update date</summary>
              <p>Listing updated: <time dateTime={source.updated}>{new Date(source.updated).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' })}</time></p>
              <ul className="mt-2">{source.sourceUrls.map((url, j) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 underline">Source {j + 1}: {new URL(url).hostname} ↗<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul>
            </details>
          </li>)}</ol>
        </div>
      </article>)}</div>
    </div>
    <form onSubmit={submit} className="border-t border-[var(--perm-border)] bg-white/70 p-5 sm:p-6">
      <fieldset className="mb-3 flex flex-wrap gap-2" disabled={pending}><legend className="mb-2 text-sm font-semibold">What kind of help?</legend>
        {([['site', 'Local listings'], ['general', 'General permaculture']] as const).map(([value, label]) => <label key={value} className={`${control} flex cursor-pointer items-center gap-2 ${kind === value ? 'bg-[var(--perm-bg)]' : ''}`}><input type="radio" name="kind" value={value} checked={kind === value} onChange={() => setKind(value)} />{label}</label>)}
      </fieldset>
      {kind === 'site' && <label className="mb-3 block text-sm">Search in <select value={category} disabled={pending} onChange={e => setCategory(e.target.value as HelperCategory)} className={`${control} ml-2`}>{[['all', 'All listings'], ['groups', 'Groups'], ['events', 'Events'], ['grants', 'Grants'], ['land', 'Land connections']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
      <label htmlFor="helper-question" className="block text-sm font-semibold">{kind === 'site' ? 'Name, place or question' : 'Your permaculture question'}</label>
      <textarea id="helper-question" ref={input} value={query} onChange={e => setQuery(e.target.value)} maxLength={500} disabled={pending} rows={2} className={`${control} mt-2 w-full resize-y`} aria-describedby="helper-privacy" placeholder={kind === 'site' ? 'e.g. community gardens in Mullumbimby' : 'e.g. how do I start a compost pile?'} />
      <div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-[var(--perm-muted)]">{query.length}/500</span><button type="submit" disabled={pending || query.trim().length < 2} className="min-h-11 rounded-xl bg-[var(--perm-primary)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--perm-primary)]">{pending ? 'Looking…' : kind === 'site' ? 'Find local listings' : 'Ask about permaculture'}</button></div>
      <p id="helper-privacy" className="mt-3 text-xs leading-relaxed text-[var(--perm-muted)]">Please leave out personal or sensitive details. This chat stays in this tab’s memory and clears on reload. {aiEnabled ? 'Your current question and matching public listings are sent to the AI provider.' : 'No question is sent to an AI provider in this preview.'}</p>
      <p className="sr-only" role="status" aria-live="polite">{pending ? 'Looking up your question.' : turns.length ? 'Answer ready below your question.' : ''}</p>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    </form>
  </section>;
}
