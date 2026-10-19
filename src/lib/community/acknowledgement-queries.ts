import { sql } from 'drizzle-orm';

export type AcknowledgementTarget = { threadId: string; topicSlug: string; messageId?: string };
export type AcknowledgementState = { count: number; selected: boolean };
export type AcknowledgementActor = { id: string; sessionVersion: number };
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function validAcknowledgementTarget(value: AcknowledgementTarget) {
  return typeof value?.threadId === 'string' && uuid.test(value.threadId) &&
    typeof value.topicSlug === 'string' && /^[a-z0-9-]{1,150}$/.test(value.topicSlug) &&
    (value.messageId === undefined || typeof value.messageId === 'string' && uuid.test(value.messageId));
}

/** Match thread detail/publicMessagesQuery: topic, thread author and reply author must exist.
 * There are currently no private/soft-deleted discussion rows. Extend this boundary
 * together with those readers if moderation or private topics are introduced.
 */
export function visibleAcknowledgementTarget(target: AcknowledgementTarget) {
  return sql`select ${target.messageId ? sql`m.id` : sql`t.id`} as id
    from threads t join topics p on p.id=t.topic_id join users author on author.id=t.author_id
    ${target.messageId ? sql`join messages m on m.thread_id=t.id join users ma on ma.id=m.author_id` : sql``}
    where t.id=${target.threadId}::uuid and p.slug=${target.topicSlug}
    ${target.messageId ? sql`and m.id=${target.messageId}::uuid` : sql``}`;
}

/** Desired state, not a blind toggle: retries and concurrent repeated taps are idempotent. */
export function acknowledgementMutation(actor: AcknowledgementActor, target: AcknowledgementTarget, selected: boolean) {
  const table = target.messageId ? sql`message_acknowledgements` : sql`thread_acknowledgements`;
  return sql`insert into ${table}(target_id,user_id,active)
    select target.id,u.id,${selected} from (${visibleAcknowledgementTarget(target)}) target
    join users u on u.id=${actor.id}::uuid and u.session_version=${actor.sessionVersion}
    on conflict(target_id,user_id) do update set active=excluded.active
    returning target_id`;
}

export function acknowledgementSummary(target: AcknowledgementTarget, actorId: string | null) {
  const table = target.messageId ? sql`message_acknowledgements` : sql`thread_acknowledgements`;
  return sql`select count(a.user_id) filter(where a.active)::integer as count,
    coalesce(bool_or(a.active and a.user_id=${actorId}::uuid),false) as selected
    from (${visibleAcknowledgementTarget(target)}) target
    left join ${table} a on a.target_id=target.id group by target.id`;
}
