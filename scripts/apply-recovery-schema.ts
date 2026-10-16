/** Additive migration for the existing database (originally provisioned with db:push).
 * Run: node --import tsx scripts/apply-recovery-schema.ts [--apply]
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

loadEnvConfig(process.cwd());

async function main() {
  const db = neon(process.env.DATABASE_URL!);
  const [state] = await db`select
    exists(select 1 from information_schema.columns where table_schema='public' and table_name='users' and column_name='session_version') as version,
    to_regclass('public.password_reset_tokens') is not null as tokens,
    to_regclass('public.password_reset_limits') is not null as limits`;
  if (state.version && state.tokens && state.limits) {
    console.log("Recovery schema already present; no changes made.");
    return;
  }
  if (state.version || state.tokens || state.limits) throw new Error("Partial recovery schema: inspect before proceeding.");
  if (!process.argv.includes("--apply")) {
    console.log("Would add session_version and two password recovery tables. Pass --apply to execute atomically.");
    return;
  }
  const statements = readFileSync("src/lib/db/migrations/0005_password_recovery.sql", "utf8").split("--> statement-breakpoint").filter((s) => s.trim());
  await db.transaction(statements.map((statement) => db.query(statement, [])));
  console.log("Password recovery schema applied atomically.");
}
main().catch(() => { console.error("Recovery schema update failed. No credentials are logged."); process.exitCode = 1; });
