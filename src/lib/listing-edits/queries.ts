import { sql } from 'drizzle-orm';
import type { ListingContent } from './policy';
import { grantExpiry, metadataPatch } from './policy';

export type Mutation = {
  id: string; type: string; version: string; actorId: string; sessionVersion: number;
  revisionId: string; before: ListingContent; after: ListingContent; summary: string;
  kind: 'edit' | 'rollback'; restoredFromId: string | null;
};
/** One atomic update + append-only revision. Session identity never comes from the form. */
export function mutationQuery(input: Mutation) {
  const c = input.after;
  const patch = JSON.stringify(metadataPatch(c, input.type));
  return sql`
    with actor as materialized (
      select id, case when nullif(trim(display_name),'') is not null and display_name not like '%@%' then left(trim(display_name),150)
        when nullif(trim(username),'') is not null and username not like '%@%' then left(trim(username),150) else 'Community member' end as name
      from users where id=${input.actorId}::uuid and session_version=${input.sessionVersion}
        and (${input.kind}='edit' or role='admin')
    ), allowance as (
      insert into listing_edit_limits(user_id,window_start,attempts)
      select id,date_trunc('hour',now()),1 from actor
      on conflict(user_id) do update set
        attempts=case when listing_edit_limits.window_start < date_trunc('hour',now()) then 1 else listing_edit_limits.attempts+1 end,
        window_start=date_trunc('hour',now())
      returning user_id,attempts
    ), changed as (
      update posts p set title=${c.title},description=${c.description},contact_method=${c.contactMethod||null},
        contact_phone=${c.contactPhone||null},contact_email=${c.contactEmail||null},external_url=${c.externalUrl||null},
        region=${c.region||null}::region,location_detail=${c.locationDetail||null},
        expires_at=case when p.type='grant' then ${input.type==='grant'?grantExpiry(c):null}::timestamptz at time zone 'UTC' else p.expires_at end,
        metadata=p.metadata || ${patch}::jsonb || jsonb_build_object('communityEditedBy',actor.name,'communityEditedAt',clock_timestamp(),'communityRevisionId',${input.revisionId}::text),
        updated_at=clock_timestamp()
      from actor,allowance
      where p.id=${input.id}::uuid and p.type=${input.type}::post_type
        and p.type in ('directory_entry','grant','land_available','land_wanted') and p.status in ('active','expired')
        and p.id::text||':'||p.updated_at::text=${input.version}
        and allowance.user_id=actor.id and allowance.attempts<=60
        and (${input.kind}='edit' or exists(select 1 from listing_revisions r where r.id=${input.restoredFromId}::uuid and r.post_id=p.id))
      returning p.id
    ), logged as (
      insert into listing_revisions(id,post_id,editor_id,editor_name,kind,summary,before,after,restored_from_id)
      select ${input.revisionId}::uuid,changed.id,actor.id,actor.name,${input.kind},${input.summary},${JSON.stringify(input.before)}::jsonb,${JSON.stringify(c)}::jsonb,${input.restoredFromId}::uuid
      from changed,actor returning id
    ) select id from logged`;
}
