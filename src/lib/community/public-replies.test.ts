import assert from "node:assert/strict";
import test from "node:test";
import { neon } from "@neondatabase/serverless";
import { db } from "@/lib/db";
import { publicReplyStats } from "./public-replies";
import { recentlyActiveThreadsQuery } from "./service";

// Read-only CTE fixtures shadow every referenced table; no production rows are
// read or written. Deleted replies are absent from messages; private account
// subscriptions are a separate source and must never contribute to activity.
const fixture = `with
users(id,display_name,username) as (values ('author','Public author','author')),
topics(id,slug,name) as (values ('topic','soil','Soil')),
threads(id,topic_id,author_id,title,body,region,tags,is_pinned,is_locked,reply_count,last_activity_at,created_at,updated_at) as (
 select id,'topic','author',id,'Body',null::text,'[]'::jsonb,false,false,99,
 '2026-10-19'::timestamp,'2026-10-19'::timestamp,'2026-10-19'::timestamp
 from (values ('a'),('b'),('c'),('d'),('boundary'),('future'),('deleted'),('private-only'),('orphan')) t(id)
),
messages(id,thread_id,author_id,parent_id,body,created_at,updated_at) as (values
 ('1','a','author',null::text,'Public','2026-10-18 23:59:00'::timestamp,'2026-10-18'::timestamp),
 ('2','b','author',null,'Public','2026-10-18 23:58:00','2026-10-18'),
 ('3','c','author',null,'Public','2026-10-18 23:57:00','2026-10-18'),
 ('4','d','author',null,'Public','2026-10-18 23:56:00','2026-10-18'),
 ('5','a','author',null,'Old','2026-09-01','2026-10-18'),
 ('6','boundary','author',null,'Boundary','2026-10-12 00:00:00','2026-10-18'),
 ('7','future','author',null,'Future','2026-10-19 00:00:01','2026-10-18'),
 ('8','orphan','missing-author',null,'Not in public view','2026-10-18 23:59:59','2026-10-18')
),
subscriptions(thread_id,created_at) as (values ('private-only','2026-10-18 23:59:59'::timestamp))
`;
const now = new Date("2026-10-19T00:00:00Z");
const options = { skip: !process.env.DATABASE_URL };

test("real ranking query caps at three public replied threads and ignores cached activity/private subscriptions", options, async () => {
  const query = recentlyActiveThreadsQuery(now).toSQL();
  const rows = await neon(process.env.DATABASE_URL!).query(fixture + query.sql, query.params);
  assert.deepEqual(rows.map((r) => r.id), ["a", "b", "c"]);
  assert.ok(!query.sql.includes('"email"') && !query.sql.includes('"subscriptions"'));
});
test("public reply aggregates count actual messages, exclude absent/deleted and author-hidden rows, and use creation not edit time", options, async () => {
  const stats = publicReplyStats(now);
  const query = db.select({ id: stats.threadId, count: stats.totalReplyCount, latest: stats.lastReplyAt, recent: stats.recentReplyTimes }).from(stats).toSQL();
  const rows = await neon(process.env.DATABASE_URL!).query(fixture + query.sql, query.params);
  const a = rows.find((r) => r.thread_id === "a")!;
  assert.equal(a.total_reply_count, 2);
  assert.equal(a.recent_reply_times.length, 1);
  assert.equal(a.recent_reply_times[0], Date.parse("2026-10-18T23:59:00Z"));
  assert.ok(!rows.some((r) => ["deleted", "private-only", "orphan"].includes(r.thread_id)));
  assert.equal(rows.find((r) => r.thread_id === "boundary")!.recent_reply_times.length, 0);
  assert.equal(rows.find((r) => r.thread_id === "future")!.recent_reply_times.length, 0);
});
test("the database returns no recent threads once all public replies expire", options, async () => {
  const query = recentlyActiveThreadsQuery(new Date("2026-10-27T00:00:00Z")).toSQL();
  const rows = await neon(process.env.DATABASE_URL!).query(fixture + query.sql, query.params);
  assert.deepEqual(rows, []);
});
