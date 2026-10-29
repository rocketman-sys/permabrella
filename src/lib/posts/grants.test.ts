import assert from "node:assert/strict";
import test from "node:test";
import { neon } from "@neondatabase/serverless";
import { PgDialect } from "drizzle-orm/pg-core";
import { and } from "drizzle-orm";
import { grantRegionVisibility, grantsClosingSoonVisibility } from "./grants";

// Read-only PostgreSQL fixtures: this CTE never reads or changes production posts.
// Run with: node --env-file=.env.local --import tsx --test src/lib/posts/grants.test.ts
const fixture = `with posts(id,type,status,event_date,expires_at,metadata,region) as (values
  ('now','grant','active',null::timestamp,'2026-10-17 01:00:00'::timestamp,'{"deadlineConfirmed":true}'::jsonb,'ballina'),
  ('next','grant','active',null,'2026-10-17 01:00:01','{"deadlineConfirmed":true}','ballina'),
  ('boundary','grant','active',null,'2026-11-16 01:00:00','{"deadlineConfirmed":true,"eligibleRegions":["ballina"]}','other'),
  ('later','grant','active',null,'2026-11-16 01:00:01','{"deadlineConfirmed":true}','ballina'),
  ('past','grant','active',null,'2026-10-16 01:00:00','{"deadlineConfirmed":true}','ballina'),
  ('undated','grant','active',null,null,'{"deadlineConfirmed":true}','ballina'),
  ('unverified','grant','active',null,'2026-10-20 01:00:00','{}','ballina'),
  ('closed','grant','active',null,'2026-10-20 01:00:00','{"deadlineConfirmed":true,"statusLabel":"Closed - track next round"}','ballina'),
  ('directory','grant','active',null,'2026-10-20 01:00:00','{"deadlineConfirmed":true,"statusLabel":"Ongoing resource"}','ballina'),
  ('upcoming','grant','active',null,'2026-10-20 01:00:00','{"deadlineConfirmed":true,"statusLabel":"Upcoming - check opening"}','ballina'),
  ('removed','grant','removed',null,'2026-10-20 01:00:00','{"deadlineConfirmed":true}','ballina'),
  ('pending','grant','pending_moderation',null,'2026-10-20 01:00:00','{"deadlineConfirmed":true}','ballina'),
  ('expired','grant','expired',null,'2026-10-20 01:00:00','{"deadlineConfirmed":true}','ballina'),
  ('event','event','active',null,'2026-10-20 01:00:00','{"deadlineConfirmed":true}','ballina'),
  ('other-town','grant','active',null,'2026-10-20 01:00:00','{"deadlineConfirmed":true,"eligibleRegions":["tweed","uki"]}','tweed'),
  ('date-only','grant','active',null,'2026-10-31 13:00:00','{"deadlineConfirmed":true,"deadlineDate":"2026-10-31"}','ballina')
) select id from posts where `;
const now = new Date("2026-10-17T01:00:00Z");
const dialect = new PgDialect();

test("closing soon includes only published, verified, current grants through the exact 30-day boundary", { skip: !process.env.DATABASE_URL }, async () => {
  const query = dialect.sqlToQuery(grantsClosingSoonVisibility(now));
  const rows = await neon(process.env.DATABASE_URL!).query(fixture + query.sql + " order by expires_at, id", query.params);
  assert.deepEqual(rows.map((row) => row.id), ["next", "other-town", "date-only", "boundary"]);
});

test("town filters include eligible statewide grants and exclude other councils", { skip: !process.env.DATABASE_URL }, async () => {
  const query = dialect.sqlToQuery(and(grantsClosingSoonVisibility(now), grantRegionVisibility("ballina"))!);
  const rows = await neon(process.env.DATABASE_URL!).query(fixture + query.sql + " order by expires_at, id", query.params);
  assert.deepEqual(rows.map((row) => row.id), ["next", "date-only", "boundary"]);
});

test("date-only grants leave the list at the next NSW midnight", { skip: !process.env.DATABASE_URL }, async () => {
  const query = dialect.sqlToQuery(grantsClosingSoonVisibility(new Date("2026-10-31T13:00:00Z")));
  const rows = await neon(process.env.DATABASE_URL!).query(fixture + query.sql, query.params);
  assert.ok(!rows.some((row) => row.id === "date-only"));
});
