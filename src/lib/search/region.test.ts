import assert from 'node:assert/strict';
import test from 'node:test';
import { neon } from '@neondatabase/serverless';
import { PgDialect } from 'drizzle-orm/pg-core';
import { and } from 'drizzle-orm';
import { searchPostRegionVisibility } from './region';
import { listingVisibility } from '@/lib/posts/visibility';

// Read-only fixtures exercise actual PostgreSQL JSON and visibility semantics.
const fixture = `with posts(id,type,status,event_date,expires_at,metadata,region) as (values
 ('local','grant','active',null::timestamp,null::timestamp,'{}'::jsonb,'tweed'),
 ('statewide','grant','active',null,null,'{"eligibleRegions":["tweed","ballina"]}','other'),
 ('other-council','grant','active',null,null,'{"eligibleRegions":["ballina"]}','ballina'),
 ('local-group','directory_entry','active',null,null,'{}','tweed'),
 ('unrelated-group','directory_entry','active',null,null,'{"eligibleRegions":["tweed"]}','other'),
 ('removed','grant','removed',null,null,'{"eligibleRegions":["tweed"]}','other'),
 ('pending','grant','pending_moderation',null,null,'{"eligibleRegions":["tweed"]}','other'),
 ('closed','grant','active',null,null,'{"eligibleRegions":["tweed"],"statusLabel":"Closed - track next round"}','other'),
 ('expired','grant','active',null,'2026-10-31 00:00:00','{"eligibleRegions":["tweed"]}','other'),
 ('past-event','event','active','2026-10-30 00:00:00',null,'{}','tweed')
) select id from posts where `;
test('regional search includes eligible grants and local groups while respecting type and publication boundaries', {skip:!process.env.DATABASE_URL}, async () => {
 const query = new PgDialect().sqlToQuery(and(listingVisibility('current', new Date('2026-11-01T00:00:00Z')), searchPostRegionVisibility('tweed'))!);
 const rows = await neon(process.env.DATABASE_URL!).query(fixture + query.sql + ' order by id', query.params);
 assert.deepEqual(rows.map(row => row.id), ['local', 'local-group', 'statewide']);
});
