import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { PgDialect } from 'drizzle-orm/pg-core';
import { contentFromRow } from './policy';
import { mutationQuery,type Mutation } from './queries';
const user='10000000-0000-4000-8000-000000000001',admin='10000000-0000-4000-8000-000000000002',post='20000000-0000-4000-8000-000000000001',other='20000000-0000-4000-8000-000000000002';
const before=contentFromRow({type:'directory_entry',title:'Original',description:'Original description',contactMethod:null,contactPhone:null,contactEmail:null,externalUrl:null,region:null,locationDetail:null,metadata:{}});
const base:Mutation={id:post,type:'directory_entry',version:`${post}:2026-10-01 00:00:00`,actorId:user,sessionVersion:0,revisionId:randomUUID(),before,after:{...before,title:'Changed'},summary:'Fix name',kind:'edit',restoredFromId:null};
const setup=[
 'create temporary table users(id uuid primary key,display_name text,username text,role text,session_version integer) on commit drop',
 "insert into users values('"+user+"','Public Editor','member','member',0),('"+admin+"','Admin Editor','admin','admin',0)",
 'create temporary table posts (like public.posts including defaults) on commit drop',
 `insert into posts(id,type,status,title,description,metadata,updated_at) values('${post}','directory_entry','active','Original','Original description','{"protected":"preserved","lastVerifiedAt":"2026-01-01"}','2026-10-01'),('${other}','directory_entry','removed','Hidden','Hidden','{}','2026-10-01')`,
 'create temporary table listing_edit_limits(user_id uuid primary key,window_start timestamptz,attempts integer) on commit drop',
 'create temporary table listing_revisions(id uuid primary key,post_id uuid,editor_id uuid,editor_name text,kind text,summary text,before jsonb,after jsonb,restored_from_id uuid,created_at timestamptz default now()) on commit drop',
];
const snapshot=`select p.id,p.title,p.status,p.source,p.author_id,p.metadata,(select count(*)::int from listing_revisions) revisions,(select jsonb_agg(jsonb_build_object('editor',editor_name,'before',before,'after',after,'kind',kind)) from listing_revisions) history from posts p order by p.id`;
const dialect=new PgDialect();
async function run(inputs:Mutation[],extra:string[]=[],tail:string[]=[]) {
 const sql=neon(process.env.DATABASE_URL!);const compiled=inputs.map(x=>dialect.sqlToQuery(mutationQuery(x)));
 return sql.transaction([...setup.map(x=>sql.query(x)),...extra.map(x=>sql.query(x)),...compiled.map(q=>sql.query(q.sql,q.params)),...tail.map(x=>sql.query(x)),sql.query(snapshot)]);
}
const options={skip:!process.env.DATABASE_URL};
test('atomic member edit writes approved fields, public attribution and exactly one revision',options,async()=>{
 const all=await run([base]);const rows=all.at(-1)!;assert.equal(rows[0].title,'Changed');assert.equal(rows[0].revisions,1);assert.equal(rows[0].metadata.protected,'preserved');assert.equal(rows[0].metadata.lastVerifiedAt,'2026-01-01');assert.equal(rows[0].metadata.communityEditedBy,'Public Editor');assert.equal(rows[0].metadata.verificationStatus,'needs_verification');assert.equal(rows[0].status,'active');assert.equal(rows[0].author_id,null);assert.equal(rows[0].source,'direct');assert.equal(rows[0].history[0].before.title,'Original');assert.equal(rows[0].history[0].after.title,'Changed');assert.equal(rows[1].title,'Hidden');
});
test('database independently rejects absent/revoked actors, removed records, stale versions and cross-record tokens',options,async()=>{
 for(const change of [{actorId:randomUUID()},{sessionVersion:1},{id:other},{version:base.version+'stale'},{version:`${other}:2026-10-01 00:00:00`},{kind:'rollback' as const,restoredFromId:randomUUID()}]){const all=await run([{...base,...change}]);const row=all.at(-1)![0];assert.equal(row.title,'Original');assert.equal(row.revisions,0);}
});
test('two writers using the same version cannot silently overwrite each other',options,async()=>{const all=await run([base,{...base,revisionId:randomUUID(),after:{...before,title:'Second writer'}}]);assert.equal(all.at(-1)![0].title,'Changed');assert.equal(all.at(-1)![0].revisions,1);});
test('hourly edit allowance fails closed at the database boundary',options,async()=>{const all=await run([base],[`insert into listing_edit_limits values('${user}',date_trunc('hour',now()),60)`]);assert.equal(all.at(-1)![0].revisions,0);assert.equal(all.at(-1)![0].title,'Original');});
test('admin can restore only this listing’s revision and restoration appends history',options,async()=>{
 const sql=neon(process.env.DATABASE_URL!);const q=dialect.sqlToQuery(mutationQuery(base));
 const restore={...base,actorId:admin,revisionId:randomUUID(),kind:'rollback' as const,restoredFromId:base.revisionId,after:before};
 const rq=dialect.sqlToQuery(mutationQuery(restore));
 // Reset only the temporary fixture version to a known stamp; the production query is unchanged.
 const results=await sql.transaction([...setup.map(s=>sql.query(s)),sql.query(q.sql,q.params),sql.query(`update posts set updated_at='2026-10-01' where id='${post}'`),sql.query(rq.sql,rq.params),sql.query(snapshot)]);
 assert.equal(results.at(-1)![0].title,'Original');assert.equal(results.at(-1)![0].revisions,2);
 const invalid=await run([{...restore,restoredFromId:randomUUID()}]);assert.equal(invalid.at(-1)![0].revisions,0);
});
test('grants update public deadlines without confirming them or changing moderation state',options,async()=>{
 const content={...before,grantStatus:'Open now',deadlineDate:'2026-10-31',deadlineTime:'17:00',funding:'Up to $1,000'};
 const all=await run([{...base,type:'grant',after:content}],[`update posts set type='grant' where id='${post}'`],[`select expires_at::text from posts where id='${post}'`]);
 assert.equal(all.at(-2)![0].expires_at,'2026-10-31 06:00:00');assert.equal(all.at(-1)![0].metadata.deadlineConfirmed,false);assert.equal(all.at(-1)![0].status,'active');
});
test('admin cannot restore a revision from another listing, and ineligible post types cannot be edited',options,async()=>{
 const revision=randomUUID();const foreign=`insert into listing_revisions(id,post_id,editor_id,editor_name,kind,summary,before,after) values('${revision}','${other}','${admin}','Admin','edit','Other','{}','{}')`;
 const all=await run([{...base,actorId:admin,kind:'rollback',restoredFromId:revision}],[foreign]);assert.equal(all.at(-1)![0].title,'Original');assert.equal(all.at(-1)![0].revisions,1);
 const event=await run([{...base,type:'event'}],[`update posts set type='event' where id='${post}'`]);assert.equal(event.at(-1)![0].title,'Original');assert.equal(event.at(-1)![0].revisions,0);
});
