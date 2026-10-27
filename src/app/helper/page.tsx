import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Helper } from '@/components/helper/Helper';
import { aiConfigured, helperAvailable, helperTrialEnded, HELPER_TRIAL_END } from '@/lib/helper/policy';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'PermaBrella Helper', description: 'Find local groups, events, grants and growing connections, with optional AI guidance.', alternates: { canonical: '/helper' } };

export default async function HelperPage() {
  if (!helperAvailable()) notFound();
  const aiEnabled = aiConfigured();
  const trialEnded = helperTrialEnded();
  const trialEndDate = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' }).format(new Date(HELPER_TRIAL_END));
  let signedIn = false;
  if (aiEnabled) {
    try { signedIn = Boolean((await auth())?.user?.id); } catch { /* Free search remains available when auth is unavailable. */ }
  }
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
    <div className="grid items-start gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
      <header className="lg:sticky lg:top-24"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--perm-secondary)]">Growing connections</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-[var(--perm-primary)] sm:text-5xl">Your next local connection starts here.</h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--perm-text-secondary)]">A helping hand to explore the people, places and opportunities already shared on PermaBrella.</p>
        <div className="mt-7 rounded-2xl border border-[var(--perm-border)] bg-white/60 p-5 text-sm leading-relaxed"><p className="font-semibold">Local knowledge, with a helping hand</p><p className="mt-2">Local search uses current public listings and works without an AI answer. General guidance covers permaculture, gardening and growing food. It does not verify local availability.</p><p className="mt-2">Each question stands alone. Earlier questions and answers are not used as context.</p><p className="mt-2">{trialEnded ? `The AI trial ended on ${trialEndDate} at 11 am NSW time and is awaiting review. Local listing search remains available.` : `AI answers are available to signed-in members during a limited trial, subject to the shared allowance. The trial runs until ${trialEndDate} at 11 am NSW time (00:00 UTC), when we will review it. Local search remains available afterwards.`}</p></div>
      </header>
      <Helper aiEnabled={aiEnabled} signedIn={signedIn} />
    </div>
  </div>;
}
