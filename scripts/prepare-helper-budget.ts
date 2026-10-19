/** Explicit operator command for the approved, non-renewing PR20 evaluation. */
import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { PgDialect } from 'drizzle-orm/pg-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { reservationQuery } from '../src/lib/helper/budget';
loadEnvConfig(process.env.PB_HELPER_ENV_DIR || process.cwd(), false, { info() {}, error() {} });
const budgetId = 'permabrella-pr20-2026-10-19';
const verificationId = 'verification-only-pr20-2026-10-19';
async function main() {
  assert(process.env.DATABASE_URL, 'Database configuration required');
  const sql = neon(process.env.DATABASE_URL);
  const [state] = await sql`select to_regclass('public.helper_preview_budgets')::text as budgets,to_regclass('public.helper_preview_limits')::text as limits`;
  if (process.argv.includes('--setup')) {
    if (!state.budgets && !state.limits) {
      const statements = readFileSync('docs/helper-preview-budget.sql', 'utf8').replace(/^--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean);
      assert.equal(statements.length, 2);
      assert(statements.every(s => /^create table helper_preview_(budgets|limits) \(/.test(s)));
      await sql.transaction(statements.map(s => sql.query(s)));
    } else assert(state.budgets && state.limits, 'Partial schema; stop and inspect');
    // ON CONFLICT never resets a previously used allowance.
    await sql`insert into helper_preview_budgets(id,enabled,expires_at,limit_microusd) values (${budgetId},false,'2026-10-27T00:00:00Z',5000000) on conflict(id) do nothing`;
  }
  if (process.argv.includes('--verify')) {
    const [existing] = await sql`select id from helper_preview_budgets where id=${verificationId}`;
    assert(!existing, 'Concurrency proof already exists; do not reset it');
    const actors = await sql`select id from users order by created_at limit 2`;
    assert.equal(actors.length, 2, 'Two existing accounts required; never insert test users');
    await sql`insert into helper_preview_budgets(id,enabled,expires_at,limit_microusd) values (${verificationId},true,now()+interval '5 minutes',25000)`;
    const dialect = new PgDialect();
    let results;
    try {
      results = await Promise.all(Array.from({ length: 20 }, (_, i) => {
        const query = dialect.sqlToQuery(reservationQuery(verificationId, actors[i % 2].id));
        return sql.query(query.sql, query.params);
      }));
    } finally {
      await sql`update helper_preview_budgets set enabled=false where id=${verificationId}`;
    }
    const accepted = results.filter(r => r.length === 1).length;
    const [after] = await sql`select enabled,limit_microusd,reserved_microusd from helper_preview_budgets where id=${verificationId}`;
    assert.equal(accepted, 2); assert.equal(after.reserved_microusd, 20000); assert.equal(after.enabled, false);
    const proof = { checkedAt: new Date().toISOString(), concurrentRequests: 20, existingAccounts: 2, accepted, denied: 20 - accepted, ...after, modelCalls: 0, note: 'Isolated disabled verification row; no model calls, user changes, or reset of the real allowance.' };
    writeFileSync('../evidence/helper-preview/budget-concurrency.json', JSON.stringify(proof, null, 2));
    console.log(JSON.stringify(proof));
  }
  if (process.argv.includes('--enable')) {
    const [proof] = await sql`select enabled,reserved_microusd,limit_microusd from helper_preview_budgets where id=${verificationId}`;
    assert(proof && !proof.enabled && proof.reserved_microusd === 20000 && proof.limit_microusd === 25000);
    await sql`update helper_preview_budgets set enabled=true where id=${budgetId} and expires_at='2026-10-27T00:00:00Z' and limit_microusd=5000000`;
  }
  if (state.budgets || process.argv.includes('--setup')) {
    console.log(JSON.stringify(await sql`select id,enabled,expires_at,limit_microusd,reserved_microusd from helper_preview_budgets where id=${budgetId}`));
  } else console.log(JSON.stringify(state));
}
main().catch(() => { console.error('Budget operation failed; inspect state before retrying. No automatic reset or retry.'); process.exitCode = 1; });
