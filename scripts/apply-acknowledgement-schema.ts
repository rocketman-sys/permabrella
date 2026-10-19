/** Additive schema deployment for installations originally provisioned with db:push. */
import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
loadEnvConfig(process.cwd());
async function main(){
 if(!process.env.DATABASE_URL)throw Error('Database required');
 const sql=neon(process.env.DATABASE_URL);
 const [state]=await sql`select to_regclass('public.thread_acknowledgements')::text as revisions,to_regclass('public.message_acknowledgements')::text as limits`;
 if(state.revisions&&state.limits){console.log('Acknowledgement tables already exist; no change.');return;}
 if(state.revisions||state.limits)throw Error('Partial schema; inspect before proceeding');
 const statements=readFileSync('src/lib/db/migrations/0007_discussion_acknowledgements.sql','utf8').split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean);
 if(statements.length!==6 || statements.some(s=>!/^(?:CREATE TABLE "(?:thread|message)_acknowledgements"|ALTER TABLE "(?:thread|message)_acknowledgements" ADD CONSTRAINT)/.test(s)))throw Error('Unexpected migration statement');
 console.log(`Validated ${statements.length} additive statements for two new tables.`);
 if(process.argv.includes('--apply')){await sql.transaction(statements.map(s=>sql.query(s)));console.log('Acknowledgement schema applied atomically. Existing account and listing records unchanged.');}
}
main().catch(()=>{console.error('Schema setup failed; inspect database state before retrying.');process.exitCode=1;});
