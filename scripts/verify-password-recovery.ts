/** Database integration check. A disposable fixture is created and removed in one transaction.
 * No emails are sent and no existing account is modified.
 * node --import tsx scripts/verify-password-recovery.ts --run
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { PgDialect } from "drizzle-orm/pg-core";
import { consumeResetTokenQuery, resetTokenHash } from "../src/lib/auth/reset";

loadEnvConfig(process.cwd());
async function main() {
  if (!process.argv.includes("--run")) throw new Error("Pass --run to test with a disposable database fixture.");
  const db = neon(process.env.DATABASE_URL!);
  const id = randomUUID();
  const password = randomUUID();
  const hash = await bcrypt.hash(password, 12);
  const tokenHash = resetTokenHash(randomUUID());
  const dialect = new PgDialect();
  const consume = dialect.sqlToQuery(consumeResetTokenQuery(tokenHash, hash, new Date()));
  const results = await db.transaction([
    db`insert into users (id,email,username,password_hash) values (${id},${id + "@example.invalid"},${id},'test-only')`,
    db`insert into password_reset_tokens (user_id,token_hash,expires_at) values (${id},${tokenHash},now()+interval '30 minutes')`,
    db.query(consume.sql, consume.params),
    db.query(consume.sql, consume.params),
    db`select password_hash,session_version from users where id=${id}`,
    db`insert into password_reset_tokens (user_id,token_hash,expires_at) values (${id},${tokenHash},now()-interval '1 minute')`,
    db.query(consume.sql, consume.params),
    db`select session_version from users where id=${id}`,
    db`delete from users where id=${id}`,
  ]);
  assert.equal(results[2].length, 1, "Valid token must reset exactly one fixture account");
  assert.equal(results[3].length, 0, "Consumed token must not be reusable");
  assert.equal(results[4][0].session_version, 1, "Existing session version must be revoked");
  assert.ok(await bcrypt.compare(password, results[4][0].password_hash), "New password must verify");
  assert.equal(results[6].length, 0, "Expired token must be rejected");
  assert.equal(results[7][0].session_version, 1, "Expired token must not change the account");
  const remaining = await db`select id from users where id=${id}`;
  assert.equal(remaining.length, 0, "Fixture must be removed");
  console.log("PASS: single-use reset, password verification, session revocation, expiry and fixture cleanup.");
}
main().catch((error) => { console.error(error instanceof assert.AssertionError ? error.message : "Recovery integration check failed."); process.exitCode = 1; });
