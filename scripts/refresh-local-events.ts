/** Source-backed additions only. Dry run by default; guarded soft-removal rollback. */
import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';
import { readFileSync,writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseRegionParam } from '../src/lib/regions';
import { parseSydneyDateTime } from '../src/lib/posts/dates';
type Entry={id:string;key:string;title:string;description:string;eventDate:string;externalUrl:string;region:string;locationDetail:string;contactEmail:string|null;contactPhone:string|null;metadata:Record<string,unknown> & {sourceUrls:string[];parentDirectoryId?:string}};
type Backup={batch:string;state:'prepared'|'applied';existingEvents:unknown[];additions:{id:string;hash:string;updatedAt?:string}[]};
function safeUrl(value:unknown){try{const u=new URL(String(value));return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}}
async function main(){
 if(!process.env.DATABASE_URL)throw Error('Database required');
 const sql=neon(process.env.DATABASE_URL);const apply=process.argv.includes('--apply');
 const restore=process.argv.find(v=>v.startsWith('--restore='))?.slice(10);
 const data=JSON.parse(readFileSync('data/events-survey-2026-10-19.json','utf8')) as {batch:string;checkedDate:string;entries:Entry[]};
 if(restore){
  const b=JSON.parse(readFileSync(restore,'utf8')) as Backup;
  if(b.state!=='applied'||b.batch!==data.batch||!b.additions.length)throw Error('Invalid backup');
  const rows=await sql`select id,updated_at::text,metadata,status from posts where type='event' and metadata->>'eventResearchBatch'=${b.batch}`;
  const queries=b.additions.map(a=>{const row=rows.find(r=>r.id===a.id);if(!row||row.updated_at!==a.updatedAt||row.metadata.eventResearchHash!==a.hash||row.status!=='active')throw Error('Rollback conflict: review later edits');
   return sql`with changed as(update posts set status='removed',updated_at=now() where id=${a.id}::uuid and type='event' and updated_at=${a.updatedAt}::timestamp and metadata->>'eventResearchHash'=${a.hash} returning id) select 1/count(*)::integer as restored from changed`;});
  console.log(`Validated soft-removal rollback for ${queries.length} additions${apply?' (apply)':' (dry run)'}.`);if(apply)await sql.transaction(queries,{isolationLevel:'Serializable'});return;
 }
 const rows=await sql`select id,title,description,external_url,event_date::text,region,location_detail,contact_email,contact_phone,metadata,status,updated_at::text from posts where type='event'`;
 const groups=await sql`select id from posts where type='directory_entry' and status='active'`;
 const queries=[];const b:Backup={batch:data.batch,state:'prepared',existingEvents:rows,additions:[]};const ids=new Set<string>();const identities=new Set<string>();
 for(const e of data.entries){
  const date=new Date(e.eventDate);const day=date.toLocaleDateString('en-CA',{timeZone:'Australia/Sydney'});
  if(!/^[a-f0-9-]{36}$/.test(e.id)||ids.has(e.id)||!e.title||!e.description||!e.locationDetail||!parseRegionParam(e.region)||Number.isNaN(date.getTime())||day<data.checkedDate)throw Error('Invalid event identity/content/date');ids.add(e.id);
  if(!safeUrl(e.externalUrl)||!e.metadata.dateEvidence||!e.metadata.sourceUrls?.length||e.metadata.sourceUrls.some(u=>!safeUrl(u)))throw Error('Invalid event source evidence');
  if(e.metadata.eventTimeConfirmed===false&&!e.metadata.verificationNote)throw Error('Missing time uncertainty note');
  if(e.metadata.parentDirectoryId&&!groups.some(g=>g.id===e.metadata.parentDirectoryId))throw Error('Missing related organisation');
  const identity=e.externalUrl.replace(/\/tickets\/?$/,'').replace(/\/$/,'')+'|'+day;
  if(identities.has(identity))throw Error('Duplicate batch event');identities.add(identity);
  const hash=createHash('sha256').update(JSON.stringify(e)).digest('hex');const row=rows.find(r=>r.id===e.id);
  if(row){
   const expected={title:e.title,description:e.description,external_url:e.externalUrl,region:e.region,location_detail:e.locationDetail,contact_email:e.contactEmail,contact_phone:e.contactPhone};
   if(row.metadata.eventResearchHash!==hash||row.status!=='active'||Object.entries(expected).some(([k,v])=>row[k]!==v)||new Date(row.event_date.replace(' ','T')+'Z').getTime()!==date.getTime())throw Error('Existing event was edited; review before reapplying');
   console.log(`Already applied: ${e.title}`);continue;
  }
  const start=parseSydneyDateTime(day+'T00:00')!.toISOString();const next=new Date(day+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);const end=parseSydneyDateTime(next.toISOString().slice(0,10)+'T00:00')!.toISOString();
  const urls=[...new Set([e.externalUrl,e.metadata.sourceUrls[0]].flatMap(u=>[u,u.replace(/\/tickets\/?$/,'')]))];
  const duplicates=await sql`select id from posts where type='event' and (event_date is null or event_date>=${start}::timestamp and event_date<${end}::timestamp) and (lower(trim(title))=lower(${e.title}) or external_url=any(${urls}::text[]) or metadata->'sourceUrls' ?| ${urls}::text[])`;
  if(duplicates.length)throw Error(`Potential duplicate event: ${e.title}`);
  const metadata={...e.metadata,eventResearchBatch:data.batch,eventResearchHash:hash};
  queries.push(sql`with changed as(insert into posts(id,type,status,source,title,description,event_date,external_url,external_id,region,location_detail,contact_email,contact_phone,metadata)
    select ${e.id}::uuid,'event','active','direct',${e.title},${e.description},${date.toISOString()}::timestamp,${e.externalUrl},${'research:'+e.key},${e.region}::region,${e.locationDetail},${e.contactEmail},${e.contactPhone},${JSON.stringify(metadata)}::jsonb
    where not exists(select 1 from posts where type='event' and (event_date is null or event_date>=${start}::timestamp and event_date<${end}::timestamp) and (lower(trim(title))=lower(${e.title}) or external_url=any(${urls}::text[]) or metadata->'sourceUrls' ?| ${urls}::text[]))
    on conflict(id) do nothing returning updated_at) select 1/count(*)::integer as applied,max(updated_at)::text as updated_at from changed`);
  b.additions.push({id:e.id,hash});console.log(`Add: ${day} · ${e.title}`);
 }
 console.log(`${queries.length} new events; ${rows.length} existing events preserved${apply?' (apply)':' (dry run)'}.`);
 if(process.argv.includes('--test-transaction')) {
  const result=await sql.transaction([sql.query('create temporary table posts (like public.posts including all) on commit drop'),...queries],{isolationLevel:'Serializable'});
  console.log(`Temporary transaction passed: ${result.length-1} event inserts; no public rows changed.`);return;
 }
 if(!apply||!queries.length)return;
 const path=join(tmpdir(),`permabrella-events-${Date.now()}.json`);writeFileSync(path,JSON.stringify(b,null,2),{flag:'wx',mode:0o600});console.log(`Prepared backup: ${path}`);
 const result=await sql.transaction(queries,{isolationLevel:'Serializable'});result.forEach((r,i)=>b.additions[i].updatedAt=r[0].updated_at);b.state='applied';
 const afterPath=path.replace('.json','.applied.json');writeFileSync(afterPath,JSON.stringify(b,null,2),{flag:'wx',mode:0o600});console.log(`Applied atomically. Guarded rollback backup: ${afterPath}`);
}
main().catch(error=>{if(error&&typeof error.code==='string'&&/^[A-Z0-9]{5}$/.test(error.code))console.error(`Database diagnostic ${error.code}: ${error.message}`);console.error(error instanceof Error&&/^(Invalid|Duplicate|Missing|Potential duplicate|Existing event|Rollback conflict)/.test(error.message)?error.message:'Event refresh failed; inspect backup/database state before retrying.');process.exitCode=1;});
