'use server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { acknowledgementMutation, acknowledgementSummary, validAcknowledgementTarget, type AcknowledgementState, type AcknowledgementTarget } from '@/lib/community/acknowledgement-queries';

export async function setAcknowledgement(target: AcknowledgementTarget, selected: boolean): Promise<{state?:AcknowledgementState;error?:string}> {
  const session = await auth();
  if (!session?.user?.id) return {error:'Sign in to acknowledge this post.'};
  if (!validAcknowledgementTarget(target) || typeof selected !== 'boolean') return {error:'This post is not available.'};
  try {
    const changed=await db.execute(acknowledgementMutation({id:session.user.id,sessionVersion:session.user.sessionVersion},target,selected));
    if (!changed.rows.length) return {error:'This post is no longer available, or your session has ended. Reload the page and try again.'};
    const result=await db.execute(acknowledgementSummary(target,session.user.id));
    if (!result.rows.length) return {error:'This post is no longer available.'};
    revalidatePath(`/community/${target.topicSlug}/${target.threadId}`);
    return {state:result.rows[0] as AcknowledgementState};
  } catch {
    return {error:'Your acknowledgement could not be saved. Please try again.'};
  }
}
