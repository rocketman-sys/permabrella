import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { PgDialect } from 'drizzle-orm/pg-core';
import { acknowledgementMutation, acknowledgementSummary, validAcknowledgementTarget } from './acknowledgement-queries';
const actor={id:'10000000-0000-4000-8000-000000000001',sessionVersion:0};
const other={id:'10000000-0000-4000-8000-000000000002',sessionVersion:0};
const target={threadId:'20000000-0000-4000-8000-000000000001',topicSlug:'gardening'};
const messageId='30000000-0000-4000-8000-000000000001';
test('validates public target identifiers and refuses injected paths',()=>{
 assert.ok(validAcknowledgementTarget(target));assert.ok(validAcknowledgementTarget({...target,messageId}));
 for(const t of [{...target,threadId:'x'},{...target,topicSlug:'../../admin'},{...target,messageId:''}])assert.equal(validAcknowledgementTarget(t),false);
});
test('isolated database: idempotence, concurrent counts, identity, visibility and deletion', {skip:!process.env.DATABASE_URL},async t=>{
 const sql=neon(process.env.DATABASE_URL!);const schema='ack_test_'+randomUUID().replaceAll('-','');const dialect=new PgDialect();
 const query=(s:string)=>sql.query(s);
 const execute=async(q:Parameters<typeof dialect.sqlToQuery>[0])=>{const c=dialect.sqlToQuery(q);const rows=await sql.transaction([query(`set local search_path to ${schema}`),sql.query(c.sql,c.params)]);return rows[1];};
 const summary=(who:string|null=actor.id,reply=false)=>execute(acknowledgementSummary(reply?{...target,messageId}:target,who));
 await query(`create schema ${schema}`);
 try {
  await sql.transaction([query(`set local search_path to ${schema}`),
   query('create table users(id uuid primary key,session_version integer)'),query('create table topics(id uuid primary key,slug text)'),
   query('create table threads(id uuid primary key,topic_id uuid,author_id uuid)'),query('create table messages(id uuid primary key,thread_id uuid,author_id uuid)'),
   query('create table thread_acknowledgements(target_id uuid references threads(id) on delete cascade,user_id uuid references users(id) on delete cascade,active boolean,primary key(target_id,user_id))'),
   query('create table message_acknowledgements(target_id uuid references messages(id) on delete cascade,user_id uuid references users(id) on delete cascade,active boolean,primary key(target_id,user_id))'),
   query(`insert into users values('${actor.id}',0),('${other.id}',0)`),query(`insert into topics values('${target.threadId}','gardening')`),
   query(`insert into threads values('${target.threadId}','${target.threadId}','${actor.id}')`),query(`insert into messages values('${messageId}','${target.threadId}','${actor.id}')`)]);
  await t.test('repeated adds and removals change only one member choice',async()=>{
   await execute(acknowledgementMutation(actor,target,true));await execute(acknowledgementMutation(actor,target,true));
   assert.deepEqual((await summary())[0],{count:1,selected:true});
   await execute(acknowledgementMutation(actor,target,false));await execute(acknowledgementMutation(actor,target,false));
   assert.deepEqual((await summary())[0],{count:0,selected:false});
  });
  await t.test('concurrent identical taps stay at one and separate members count independently',async()=>{
   await Promise.all(Array.from({length:6},()=>execute(acknowledgementMutation(actor,target,true))));
   assert.equal((await summary())[0].count,1);
   await Promise.all([execute(acknowledgementMutation(actor,target,true)),execute(acknowledgementMutation(other,target,true))]);
   assert.deepEqual((await summary(null))[0],{count:2,selected:false});
   await Promise.all(Array.from({length:4},()=>execute(acknowledgementMutation(actor,target,false))));
   assert.deepEqual((await summary())[0],{count:1,selected:false});
  });
  await t.test('server checks identity, session revocation, correct topic and reply membership',async()=>{
   for(const [a,v] of [[{...actor,id:randomUUID()},target],[{...actor,sessionVersion:1},target],[actor,{...target,topicSlug:'private'}],[actor,{...target,threadId:randomUUID()}],[actor,{...target,messageId:randomUUID()}]] as const)assert.equal((await execute(acknowledgementMutation(a,v,true))).length,0);
   await execute(acknowledgementMutation(actor,{...target,messageId},true));
   assert.deepEqual((await summary(actor.id,true))[0],{count:1,selected:true});
   assert.deepEqual((await summary())[0],{count:1,selected:false});
  });
  await t.test('deleted replies reject new acknowledgements and cascade away their counts',async()=>{
   await sql.transaction([query(`set local search_path to ${schema}`),query(`delete from messages where id='${messageId}'`)]);
   assert.equal((await execute(acknowledgementMutation(actor,{...target,messageId},true))).length,0);assert.equal((await summary(actor.id,true)).length,0);
   const r=await sql.transaction([query(`set local search_path to ${schema}`),query('select count(*)::integer as count from message_acknowledgements')]);assert.equal(r[1][0].count,0);
  });
 } finally {await query(`drop schema ${schema} cascade`);}
});
