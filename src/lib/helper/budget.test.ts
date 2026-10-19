import assert from 'node:assert/strict';
import test from 'node:test';
import { neon } from '@neondatabase/serverless';
import { PgDialect } from 'drizzle-orm/pg-core';
import { reservationQuery } from './budget';

const user = '10000000-0000-4000-8000-000000000001';
const other = '10000000-0000-4000-8000-000000000002';
const options = { skip: !process.env.DATABASE_URL };
async function run(actors: string[], limit = 100_000, enabled = true, expired = false) {
  const sql = neon(process.env.DATABASE_URL!);
  const dialect = new PgDialect();
  const requests = actors.map(actor => dialect.sqlToQuery(reservationQuery('test-only', actor)));
  // Transaction-scoped temporary tables shadow the names without touching app data.
  return sql.transaction([
    sql.query('create temporary table helper_preview_budgets (id text primary key, enabled boolean, expires_at timestamptz, limit_microusd integer, reserved_microusd integer) on commit drop'),
    sql.query('create temporary table helper_preview_limits (budget_id text, user_id uuid, window_start timestamptz, attempts integer, primary key(budget_id,user_id)) on commit drop'),
    sql.query("insert into helper_preview_budgets values ('test-only',$1,now()+$2::interval,$3,0)", [enabled, expired ? '-1 minute' : '1 hour', limit]),
    ...requests.map(q => sql.query(q.sql, q.params)),
    sql.query('select reserved_microusd, (select max(attempts) from helper_preview_limits) attempts from helper_preview_budgets'),
  ]);
}
test('budget reservations stop before overspend and are shared across users', options, async () => {
  const result = await run([user, other, user], 25_000);
  assert.deepEqual(result.slice(3, -1).map(r => r.length), [1, 1, 0]);
  assert.equal(result.at(-1)![0].reserved_microusd, 20_000);
});
test('per-user hourly limit fails closed even with unused global allowance', options, async () => {
  const result = await run(Array(11).fill(user), 1_000_000);
  assert.equal(result.at(-2)!.length, 0);
  assert.equal(result.at(-1)![0].reserved_microusd, 100_000);
  assert.equal(result.at(-1)![0].attempts, 11);
});
test('paused and expired allowances cannot reserve any spend', options, async () => {
  for (const [enabled, expired] of [[false, false], [true, true]]) {
    const result = await run([user], 100_000, enabled, expired);
    assert.equal(result.at(-2)!.length, 0);
    assert.equal(result.at(-1)![0].reserved_microusd, 0);
  }
});
