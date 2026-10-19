import Link from 'next/link';
import { connection } from 'next/server';
import { latestConversationsQuery } from '@/lib/community/service';
import { conversationExcerpt } from '@/lib/community/excerpt';
import { formatEventWhen } from '@/lib/posts/format';
import type { Region } from '@/lib/regions';

export async function LatestConversations({ region }: { region?: Region }) {
  await connection();
  let rows: Awaited<ReturnType<typeof latestConversationsQuery>> = [];
  let failed = false;
  try { rows = await latestConversationsQuery(region); }
  catch { failed = true; console.error('[homepage] Unable to load public conversations.'); }
  return <section className="mt-8" aria-labelledby="latest-conversations-heading">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="latest-conversations-heading" className="pb-display text-2xl">Latest conversations</h2>
      <Link href="/community" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">View all discussions</Link>
    </div>
    <p className="mt-1 text-sm text-[var(--pb-ink-soft)]">The latest posts and replies{region ? ' in your selected region' : ' from the community'}.</p>
    {rows.length ? <ul className="mt-4 grid gap-4 md:grid-cols-3">{rows.map(row => <li key={row.id}>
      <Link href={`/community/${row.topicSlug}/${row.id}`} className="block h-full rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-5 transition hover:border-[var(--pb-accent-2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pb-accent-2)]">
        <p className="text-xs font-semibold text-[var(--pb-accent-2)]">{row.topicName}</p>
        <h3 className="mt-2 break-words text-lg font-semibold">{row.title}</h3>
        <p className="mt-3 break-words text-sm leading-relaxed text-[var(--pb-ink-soft)]">{conversationExcerpt(row.body)}</p>
        <p className="mt-4 text-xs leading-relaxed text-[var(--pb-muted)]">{row.isReply ? 'Last reply' : 'Started'} <time dateTime={row.latestAt.toISOString()}>{formatEventWhen(row.latestAt)}</time></p>
        <p className="mt-1 text-xs font-semibold">{row.replyCount} {row.replyCount === 1 ? 'reply' : 'replies'}</p>
      </Link>
    </li>)}</ul> : <p className="mt-4 rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-5 text-sm" role={failed ? 'status' : undefined}>{failed ? 'Conversations could not be loaded. Please visit Discussions or try again shortly.' : `No conversations listed${region ? ' in this region' : ''} yet. Visit Discussions to start one.`}</p>}
  </section>;
}
