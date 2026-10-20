/** Guarded, reversible public-listing refresh. Dry run unless --apply. */
import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseRegionParam } from '../src/lib/regions';
loadEnvConfig(process.cwd());
type Fields = { title:string;description:string;status:string;contact_method:string|null;contact_phone:string|null;contact_email:string|null;external_url:string|null;region:string|null;location_detail:string|null;tags:string[];metadata:Record<string,unknown> };
type Row = Fields & {id:string;type:string;updated_at:string};
type Entry = {id:string;existing:boolean;expectedTitle?:string;expectedUpdatedAt?:string;type:string;patch:Partial<Fields>;metadata:Record<string,unknown>};
type Backup = {state:'prepared'|'applied';batch:string;rows:{id:string;type:string;before:Fields|null;appliedUpdatedAt?:string}[]};
const keys = ['title','description','status','contact_method','contact_phone','contact_email','external_url','region','location_detail','tags','metadata'] as const;
const fields=(row:Fields):Fields=>Object.fromEntries(keys.map(k=>[k,row[k]])) as Fields;
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
async function main(){
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');
 const sql=neon(process.env.DATABASE_URL);
 const rows=await sql`select id,type,title,description,status,contact_method,contact_phone,contact_email,external_url,region,location_detail,tags,metadata,updated_at::text from posts where type in ('directory_entry','land_available','land_wanted')` as Row[];
 const apply=process.argv.includes('--apply');
 const restore=process.argv.find(x=>x.startsWith('--restore='))?.slice(10);
 function update(id:string,type:string,stamp:string,v:Fields){return sql`with changed as (
 update posts set title=${v.title},description=${v.description},status=${v.status}::post_status,
 contact_method=${v.contact_method},contact_phone=${v.contact_phone},contact_email=${v.contact_email},external_url=${v.external_url},region=${v.region}::region,location_detail=${v.location_detail},tags=${JSON.stringify(v.tags)}::jsonb,metadata=${JSON.stringify(v.metadata)}::jsonb,updated_at=now()
 where id=${id}::uuid and type=${type}::post_type and updated_at=${stamp}::timestamp returning updated_at
 ) select 1/count(*)::integer as applied,max(updated_at)::text as applied_updated_at from changed`;}
 if(restore){
  const b=JSON.parse(readFileSync(restore,'utf8')) as Backup;
  if(b.state!=='applied'||!b.batch||!b.rows.length)throw Error('Incomplete backup');
  const queries=b.rows.map(r=>{const row=rows.find(x=>x.id===r.id);if(!row||row.updated_at!==r.appliedUpdatedAt||row.metadata.listingSurveyBatch!==b.batch)throw Error('Rollback conflict; later edit must be reviewed');return update(r.id,r.type,r.appliedUpdatedAt!,r.before??{...fields(row),status:'removed'});});
  console.log(`Rollback: ${queries.length} records validated${apply?' for atomic restore':' in dry run'}.`);if(apply)await sql.transaction(queries);return;
 }
 const inputFile=process.argv.find(x=>x.startsWith('--file='))?.slice(7)??'data/listing-survey-2026-10-19.json';
 const data=JSON.parse(readFileSync(inputFile,'utf8')) as {batch:string;checkedDate:string;entries:Entry[]};
 const queries=[];const backup:Backup={state:'prepared',batch:data.batch,rows:[]};const ids=new Set<string>();let additions=0;let updates=0;
 for(const e of data.entries){
  if(ids.has(e.id)||!/^([a-f0-9]{8}-)([a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(e.id)||!['directory_entry','land_available','land_wanted'].includes(e.type))throw Error('Invalid identity');ids.add(e.id);
  if(Object.keys(e.patch).some(k=>!keys.includes(k as typeof keys[number])||k==='metadata'))throw Error('Unapproved field');
  const row=rows.find(r=>r.id===e.id);const hash=createHash('sha256').update(JSON.stringify(e)).digest('hex');
  if(row?.metadata.listingSurveyHash===hash){
   for(const [k,v] of Object.entries(e.patch))if(!same(row[k as keyof Row],v))throw Error('Applied record was edited; review before reapplying');
   for(const [k,v] of Object.entries(e.metadata))if(!same(row.metadata[k],v))throw Error('Applied metadata was edited');
   continue;
  }
  if(e.existing&&(!row||row.title!==e.expectedTitle||row.updated_at!==e.expectedUpdatedAt||row.type!==e.type||row.status!=='active'))throw Error(`Snapshot conflict: ${e.expectedTitle}`);
  if(!e.existing&&(row||rows.some(r=>r.title.toLowerCase()===e.patch.title?.toLowerCase()||r.external_url&&r.external_url===e.patch.external_url)))throw Error(`Possible duplicate: ${e.patch.title}`);
  const v:Fields={title:'',description:'',status:'active',contact_method:null,contact_phone:null,contact_email:null,external_url:null,region:null,location_detail:null,tags:[],metadata:{},...(row?fields(row):{}),...e.patch};
  v.metadata={...(row?.metadata??{}),...e.metadata,listingSurveyBatch:data.batch,listingSurveyHash:hash};
  if(!v.title||v.title.length>300||!v.description||v.region&&!parseRegionParam(v.region)||!['active','removed'].includes(v.status))throw Error('Invalid content');
  if(v.external_url&&!['http:','https:'].includes(new URL(v.external_url).protocol))throw Error('Invalid external URL');
  if(!Array.isArray(e.metadata.sourceUrls)&&e.metadata.verificationStatus!=='needs_verification')throw Error('Source evidence required');
  if(v.status==='removed'&&(!row||row.type!=='directory_entry'||typeof v.metadata.canonicalDirectoryId!=='string'))throw Error('Only recoverable directory consolidation permitted');
  if(row){queries.push(update(e.id,e.type,row.updated_at,v));updates++;}
  else{queries.push(sql`with changed as (insert into posts(id,type,status,source,title,description,contact_method,contact_phone,contact_email,external_url,region,location_detail,tags,metadata)
   values(${e.id}::uuid,${e.type}::post_type,'active','direct',${v.title},${v.description},${v.contact_method},${v.contact_phone},${v.contact_email},${v.external_url},${v.region}::region,${v.location_detail},${JSON.stringify(v.tags)}::jsonb,${JSON.stringify(v.metadata)}::jsonb)
   on conflict(id) do nothing returning updated_at) select 1/count(*)::integer as applied,max(updated_at)::text as applied_updated_at from changed`);additions++;}
  backup.rows.push({id:e.id,type:e.type,before:row?fields(row):null});console.log(`${row?'Update':'Add'}: ${v.title} [${v.status}]`);
 }
 console.log(`${updates} updates; ${additions} additions${apply?' ready to apply':' in dry run'}.`);
 if(!apply||!queries.length)return;
 const path=join(tmpdir(),`permabrella-listing-survey-${Date.now()}.json`);writeFileSync(path,JSON.stringify(backup,null,2),{mode:0o600,flag:'wx'});console.log(`Prepared backup: ${path}`);
 const results=await sql.transaction(queries,{isolationLevel:'Serializable'});results.forEach((r,i)=>backup.rows[i].appliedUpdatedAt=r[0].applied_updated_at);backup.state='applied';const appliedPath=path.replace('.json','.applied.json');writeFileSync(appliedPath+'.tmp',JSON.stringify(backup,null,2),{mode:0o600,flag:'wx'});renameSync(appliedPath+'.tmp',appliedPath);console.log(`Applied atomically; guarded rollback: ${appliedPath}`);
}
main().catch((error)=>{console.error(error instanceof Error&&/^(Snapshot conflict|Possible duplicate|Applied record|Applied metadata|Rollback conflict|Invalid|Unapproved|Source evidence|Only recoverable|Incomplete backup)/.test(error.message)?error.message:'Listing refresh failed; inspect backup and database state before retrying.');process.exitCode=1;});
