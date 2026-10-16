import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import { PgDialect } from "drizzle-orm/pg-core";
import { resetTokenHash, validResetToken, validResetPassword, consumeResetTokenQuery } from "./reset";
test("reset tokens use strict shape and are only stored as a digest", () => {
  const token=randomBytes(32).toString("hex");
  assert.equal(validResetToken(token),true);
  assert.equal(validResetToken("short"),false);
  assert.equal(validResetToken("z".repeat(64)),false);
  assert.notEqual(resetTokenHash(token),token);
  assert.equal(resetTokenHash(token).length,64);
});
test("password validation respects bcrypt's byte limit, including Unicode", () => {
  assert.equal(validResetPassword("short"),false);
  assert.equal(validResetPassword("a".repeat(72)),true);
  assert.equal(validResetPassword("a".repeat(73)),false);
  assert.equal(validResetPassword("🔒".repeat(19)),false);
});
test("reset consumes an unexpired token atomically and revokes existing sessions", () => {
  const query=new PgDialect().sqlToQuery(consumeResetTokenQuery("digest","password-hash",new Date("2026-10-17T00:00:00Z")));
  assert.match(query.sql,/delete from password_reset_tokens/);
  assert.match(query.sql,/expires_at >/);
  assert.match(query.sql,/session_version = session_version \+ 1/);
  assert.match(query.sql,/where id in \(select user_id from consumed\)/);
  assert.ok(query.params.includes("digest"));
  assert.ok(!query.sql.includes("password-hash"));
});
