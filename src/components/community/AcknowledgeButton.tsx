'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { setAcknowledgement } from '@/app/community/acknowledgement-actions';
import type { AcknowledgementState, AcknowledgementTarget } from '@/lib/community/acknowledgement-queries';

export function AcknowledgeButton({ target, initial, signedIn }: {target:AcknowledgementTarget;initial:AcknowledgementState;signedIn:boolean}) {
  const [state,setState]=useState(initial);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const inFlight=useRef(false);
  const path=`/community/${target.topicSlug}/${target.threadId}${target.messageId?`#message-${target.messageId}`:''}`;
  const style='inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pb-accent-2)]';
  async function acknowledge() {
    if(inFlight.current)return;
    inFlight.current=true;setPending(true);setError('');
    try {
      const result=await setAcknowledgement(target,!state.selected);
      if(result.state)setState(result.state);
      else setError(result.error??'Your acknowledgement could not be saved. Please try again.');
    } catch { setError('Your acknowledgement could not be saved. Check your connection and try again.'); }
    finally {inFlight.current=false;setPending(false);}
  }
  return <div className="mt-4">
    {signedIn ? <button type="button" onClick={acknowledge} aria-pressed={state.selected} aria-busy={pending} disabled={pending} className={`${style} ${state.selected?'border-green-700 bg-green-50 text-green-900':'border-[var(--pb-line)] bg-white text-[var(--pb-ink)]'} disabled:opacity-60`}>
      <span aria-hidden="true">👍</span> Seen &amp; read <span>({state.count})</span>{state.selected?<span aria-hidden="true">✓</span>:null}
    </button> : <Link href={`/login?callbackUrl=${encodeURIComponent(path)}`} className={`${style} border-[var(--pb-line)] underline`}><span aria-hidden="true">👍</span> Seen &amp; read ({state.count})<span className="sr-only"> — sign in to acknowledge</span></Link>}
    <p className="mt-1 text-xs text-[var(--pb-muted)]" role="status" aria-live="polite">{pending?'Saving…':state.selected?'You acknowledged this post. Select again to remove.':signedIn?'Voluntary acknowledgement.': 'Sign in to acknowledge. This is voluntary.'}</p>
    {error?<p role="alert" className="mt-2 text-sm text-red-700">{error}</p>:null}
  </div>;
}
