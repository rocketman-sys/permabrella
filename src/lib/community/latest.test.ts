import assert from 'node:assert/strict';
import test from 'node:test';
import { neon } from '@neondatabase/serverless';
import { latestConversationsQuery } from './service';
import { conversationExcerpt } from './excerpt';
const fixture=`with users(id,display_name,username) as (values('author','Public name','member')),
topics(id,slug,name) as (values('topic','soil','Soil')),
threads(id,topic_id,author_id,title,body,region,created_at) as (values
('new','topic','author','New unanswered','New post','kyogle','2026-10-18 23:59'::timestamp),
('replied','topic','author','Replied','Original body','kyogle','2026-10-01'),
('third','topic','author','Third','Third body','ballina','2026-10-18 23:57'),
('fourth','topic','author','Fourth','Body','ballina','2026-10-18 23:56'),
('future','topic','author','Future','Hidden future','kyogle','2026-10-20'),
('orphan','topic','absent','Absent author','Hidden','kyogle','2026-10-18 23:59:59')),
messages(id,thread_id,author_id,parent_id,body,created_at,updated_at) as (values
('r1','replied','author',null::text,'Latest public reply','2026-10-18 23:58'::timestamp,'2026-10-18'::timestamp),
('r2','replied','author',null,'Older reply','2026-10-18 22:00','2026-10-19'),
('r3','third','absent',null,'Missing author must not raise rank','2026-10-18 23:59:59','2026-10-19'),
('r4','fourth','author',null,'Future reply must not raise rank','2026-10-20','2026-10-20')) `;
const now=new Date('2026-10-19T00:00:00Z');const options={skip:!process.env.DATABASE_URL};
test('latest homepage ranks distinct public threads by reply or creation and includes unanswered posts',options,async()=>{
 const q=latestConversationsQuery(undefined,now).toSQL();const rows=await neon(process.env.DATABASE_URL!).query(fixture+q.sql,q.params);
 assert.deepEqual(rows.map(r=>r.id),['new','replied','third']);
 assert.ok(!q.sql.includes('"email"')&&!q.sql.includes('"subscriptions"')&&!q.sql.includes('"password_hash"'));
 assert.equal(rows[1].excerpt_body,'Latest public reply');assert.equal(rows[1].reply_count,2);assert.equal(rows[0].reply_count,0);
});
test('homepage region restriction and empty state use the same public boundary',options,async()=>{
 for(const [region,expected] of [['kyogle',['new','replied']],['nimbin',[]]] as const){const q=latestConversationsQuery(region,now).toSQL();const rows=await neon(process.env.DATABASE_URL!).query(fixture+q.sql,q.params);assert.deepEqual(rows.map(r=>r.id),expected);}
});
test('excerpts are bounded plain text, without embedded images, markup or executable links',()=>{
 assert.equal(conversationExcerpt('<img src=x onerror=bad()> **Hello** [neighbours](javascript:evil) ![photo](https://example.org/x)'),'Hello neighbours');
 assert.equal(conversationExcerpt('x'.repeat(300)).length,180);assert.equal(conversationExcerpt('  a\n b  '),'a b');
});
