/** Additive deployment for databases originally provisioned with db:push. */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
loadEnvConfig(process.cwd());
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Database required");
  const sql = neon(process.env.DATABASE_URL);
  const [state] = await sql`select to_regclass('public.network_enquiries')::text as enquiries, to_regclass('public.network_enquiry_limits')::text as limits`;
  if (state.enquiries && state.limits) { console.log("Network enquiry tables already exist; no change."); return; }
  if (state.enquiries || state.limits) throw new Error("Partial schema; inspect before proceeding");
  const statements = readFileSync("src/lib/db/migrations/0008_network_enquiries.sql", "utf8").split("--> statement-breakpoint").map(x => x.trim()).filter(Boolean);
  if (statements.length !== 3 || statements.some(s => !/^(?:CREATE TABLE "network_enquir(?:ies|y_limits)"|CREATE INDEX "network_enquiries_status_created_idx")/.test(s))) throw new Error("Unexpected migration statement");
  console.log("Validated three additive statements for private network enquiries.");
  if (process.argv.includes("--apply")) { await sql.transaction(statements.map(s => sql.query(s))); console.log("Network enquiry schema applied. Existing account and listing records unchanged."); }
}
main().catch(() => { console.error("Network enquiry setup failed; inspect database state before retrying."); process.exitCode = 1; });
