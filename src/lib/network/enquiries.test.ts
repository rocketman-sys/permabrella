import assert from "node:assert/strict";
import test from "node:test";
import { neon } from "@neondatabase/serverless";
import { PgDialect } from "drizzle-orm/pg-core";
import { canManageEnquiries, parseEnquiry } from "./options";
import { saveEnquiryQuery } from "./queries";

function form(changes: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ kind: "membership", name: " Test Grower ", email: "GROWER@example.test", area: "Kyogle", message: "", consent: "yes", ...changes })) data.set(key, value);
  data.append("interests", "Shared equipment");
  return data;
}
test("membership needs no account, normalises details and accepts optional message", () => {
  const input = parseEnquiry(form());
  assert.equal(input.name, "Test Grower"); assert.equal(input.email, "grower@example.test"); assert.equal(input.kind, "membership");
});
test("rejects missing consent, invalid type, unexpected areas, files and oversized input", () => {
  const invalid: Record<string, string>[] = [{ consent: "" }, { kind: "admin" }, { area: "unknown" }, { name: "" }, { email: "invalid" }, { message: "x".repeat(2001) }];
  for (const change of invalid) assert.throws(() => parseEnquiry(form(change)));
  const input = form(); input.set("name", new Blob(["not a name"])); assert.throws(() => parseEnquiry(input));
  const unknownInterest = form(); unknownInterest.append("interests", "Not a real option"); assert.throws(() => parseEnquiry(unknownInterest));
});
test("contact requires a message but council area is optional", () => {
  assert.throws(() => parseEnquiry(form({ kind: "contact", area: "" })));
  assert.equal(parseEnquiry(form({ kind: "contact", area: "", message: "Please help me connect with a group." })).area, "");
});
test("private inbox excludes ordinary members, moderators and absent users", () => {
  for (const role of [undefined, "member", "moderator", ""]) assert.equal(canManageEnquiries(role), false);
  assert.equal(canManageEnquiries("admin"), true);
});

// Disposable transaction-local tables: no real enquiries, accounts or email are used.
const setup = [
  "create temporary table network_enquiries (id uuid default gen_random_uuid(), kind text, name text, email text, area text, interests jsonb, message text, submission_key text unique, status text default 'new') on commit drop",
  "create temporary table network_enquiry_limits (key text primary key, attempts integer, expires_at timestamptz) on commit drop",
];
const dialect = new PgDialect();
async function run(keys: { ip: string; email: string; submission: string }[]) {
  const sql = neon(process.env.DATABASE_URL!);
  const queries = keys.map(key => dialect.sqlToQuery(saveEnquiryQuery(parseEnquiry(form()), key, new Date("2026-10-24T12:00:00Z"))));
  return sql.transaction([...setup.map(s => sql.query(s)), ...queries.map(q => sql.query(q.sql, q.params)), sql.query("select count(*)::int as count from network_enquiries")]);
}
test("duplicate submission is acknowledged once without a second inbox entry", { skip: !process.env.DATABASE_URL }, async () => {
  const keys = { ip: "ip", email: "email", submission: "same" };
  const result = await run([keys, keys]);
  assert.equal(result[2][0].allowed, true); assert.ok(result[2][0].id); assert.equal(result[3][0].id, null); assert.equal(result.at(-1)![0].count, 1);
});
test("durable rate limit blocks sixth request by either IP or email", { skip: !process.env.DATABASE_URL }, async () => {
  for (const shared of ["ip", "email"] as const) {
    const result = await run(Array.from({ length: 6 }, (_, i) => ({ ip: shared === "ip" ? "shared-ip" : `ip-${i}`, email: shared === "email" ? "shared-email" : `email-${i}`, submission: `submission-${i}` })));
    assert.equal(result.at(-2)![0].allowed, false); assert.equal(result.at(-2)![0].id, null); assert.equal(result.at(-1)![0].count, 5);
  }
});
