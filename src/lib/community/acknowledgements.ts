import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import type { AcknowledgementState, AcknowledgementTarget } from './acknowledgement-queries';
import { acknowledgementSummary } from './acknowledgement-queries';

export async function discussionAcknowledgements(target: AcknowledgementTarget, actorId: string | null) {
  const [threadResult, messageResult] = await Promise.all([
    db.execute(acknowledgementSummary(target, actorId)),
    db.execute(sql`select m.id,count(a.user_id) filter(where a.active)::integer as count,
      coalesce(bool_or(a.active and a.user_id=${actorId}::uuid),false) as selected
      from messages m join users u on u.id=m.author_id
      left join message_acknowledgements a on a.target_id=m.id
      where m.thread_id=${target.threadId}::uuid group by m.id`),
  ]);
  return { thread: threadResult.rows[0] as AcknowledgementState,
    messages: Object.fromEntries(messageResult.rows.map(r=>[r.id, {count:r.count,selected:r.selected}])) as Record<string,AcknowledgementState> };
}
