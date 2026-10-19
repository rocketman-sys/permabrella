import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { RESERVATION_MICRO_USD } from './policy';

// No table or budget is created here. Missing/unapproved configuration fails closed.
// A successful atomic update charges the full conservative reservation permanently,
// even on a timeout. Concurrent workers cannot spend the same remaining allowance.
export function reservationQuery(budgetId: string, userId: string) {
  return sql`
    with allowance as (
      insert into helper_preview_limits (budget_id,user_id,window_start,attempts)
      values (${budgetId},${userId}::uuid,date_trunc('hour',now()),1)
      on conflict (budget_id,user_id) do update set
        attempts=case when helper_preview_limits.window_start < date_trunc('hour',now()) then 1 else helper_preview_limits.attempts+1 end,
        window_start=date_trunc('hour',now())
      returning attempts
    ), reserved as (
      update helper_preview_budgets set reserved_microusd=reserved_microusd+${RESERVATION_MICRO_USD}
      where id=${budgetId} and enabled=true and expires_at>now()
        and (select attempts from allowance)<=10
        and reserved_microusd+${RESERVATION_MICRO_USD}<=limit_microusd
      returning id
    ) select id from reserved`;
}
export async function reserveGeneration(budgetId: string, userId: string): Promise<boolean> {
  const result = await db.execute(reservationQuery(budgetId, userId));
  return result.rows.length === 1;
}
