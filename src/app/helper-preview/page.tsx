import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HelperPreview } from '@/components/helper/HelperPreview';
import { aiConfigured, previewAvailable } from '@/lib/helper/policy';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Helper review preview | PermaBrella', robots: { index: false, follow: false } };

export default async function HelperPreviewPage() {
  if (!previewAvailable()) notFound();
  const aiEnabled = aiConfigured();
  let signedIn = false;
  if (aiEnabled) {
    try { signedIn = Boolean((await auth())?.user?.id); } catch { /* Free search remains available when auth is unavailable. */ }
  }
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
    <div className="grid items-start gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
      <header className="lg:sticky lg:top-24"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--perm-secondary)]">Growing connections</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-[var(--perm-primary)] sm:text-5xl">Your next local connection starts here.</h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--perm-text-secondary)]">A helping hand to explore the people, places and opportunities already shared on PermaBrella.</p>
        <div className="mt-7 rounded-2xl border border-[var(--perm-border)] bg-white/60 p-5 text-sm leading-relaxed"><p className="font-semibold">A preview for review</p><p className="mt-2">Local search uses current public listings and works without an AI answer. The separate general guidance mode covers permaculture, gardening and growing food; broader general-purpose Q&amp;A is not included in this preview.</p><p className="mt-2">Each question stands alone. Earlier questions and answers are not used as context.</p><p className="mt-2">This helper is not yet part of the public site.</p></div>
      </header>
      <HelperPreview aiEnabled={aiEnabled} signedIn={signedIn} />
    </div>
  </div>;
}
