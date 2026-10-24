import { sql } from "drizzle-orm";
import type { EnquiryInput } from "./options";

/** Rate limits and insertion share one statement, including concurrent requests. */
export function saveEnquiryQuery(input: EnquiryInput, keys: { ip: string; email: string; submission: string }, expiresAt: Date) {
  return sql`with limits as (
    insert into network_enquiry_limits (key, attempts, expires_at)
    values (${keys.ip}, 1, ${expiresAt.toISOString()}::timestamptz), (${keys.email}, 1, ${expiresAt.toISOString()}::timestamptz)
    on conflict (key) do update set attempts = network_enquiry_limits.attempts + 1
    returning attempts
  ), saved as (
    insert into network_enquiries (kind, name, email, area, interests, message, submission_key)
    select ${input.kind}, ${input.name}, ${input.email}, ${input.area}, ${JSON.stringify(input.interests)}::jsonb, ${input.message}, ${keys.submission}
    where (select max(attempts) from limits) <= 5
    on conflict (submission_key) do nothing
    returning id
  ) select (select max(attempts) from limits) <= 5 as allowed, (select id from saved) as id`;
}
