/** Explicit operator-only regression check; never run by normal builds or routes. */
import assert from 'node:assert/strict';
import { neon } from '@neondatabase/serverless';
import { generateAnswer, generationUsage, modelPayload } from '../src/lib/helper/provider';
import { retrievePublicListings } from '../src/lib/helper/retrieval';
import { RESERVATION_MICRO_USD, type HelperInput } from '../src/lib/helper/policy';

async function main() {
  assert.equal(process.env.VERCEL_ENV, 'preview');
  assert.equal(process.env.PB_HELPER_BUDGET_ID, 'permabrella-pr20-2026-10-19');
  assert.equal(process.env.PB_HELPER_REGEN_EVALUATION_ONCE, '2026-10-19-regen');
  assert(process.env.DATABASE_URL && process.env.PB_HELPER_GATEWAY_KEY);
  const key = process.env.PB_HELPER_GATEWAY_KEY;
  const sql = neon(process.env.DATABASE_URL);
  const input: HelperInput = { query: 'what grants are available for local regen', kind: 'site', category: 'all' };
  const sources = await retrievePublicListings(input);
  assert(sources.length > 0);
  modelPayload(input, sources); // Check context bounds before claiming allowance.
  // Compare-and-swap against the inspected accounting state. Never rewind,
  // refund or retry a billable outcome, and stop if other usage changed it.
  const claim = await sql`update helper_preview_budgets set reserved_microusd=reserved_microusd+${RESERVATION_MICRO_USD}
    where id=${process.env.PB_HELPER_BUDGET_ID} and enabled=true and expires_at>now()
    and reserved_microusd=40000 and limit_microusd=5000000
    and reserved_microusd+${RESERVATION_MICRO_USD}<=limit_microusd returning reserved_microusd,limit_microusd`;
  assert.equal(claim.length, 1, 'Regression allowance already claimed or accounting changed; do not retry');
  let usage: ReturnType<typeof generationUsage> | undefined;
  const fetcher: typeof fetch = async (url, options) => {
    const response = await fetch(url, options);
    if (response.ok) usage = generationUsage(await response.clone().json());
    return response;
  };
  const reply = await generateAnswer(input, sources, key, fetcher);
  assert(reply.generated && reply.sources.length > 0);
  assert(!reply.answer.includes(key));
  console.log('HELPER_REGEN_RESULT', JSON.stringify({ input, usage, answer: reply.answer, generated: reply.generated,
    sources: reply.sources.map(({ id, title, href, status, funding, eligibility, freshness }) => ({ id, title, href, status, funding, eligibility, freshness })) }));
  let cost: Record<string, unknown> = { pending: true };
  if (usage?.generationId) {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/generation?id=' + encodeURIComponent(usage.generationId), {
      headers: { Authorization: 'Bearer ' + key }, signal: AbortSignal.timeout(5000),
    });
    const value = await response.json();
    if (value.data) cost = Object.fromEntries(['id', 'total_cost', 'model', 'provider_name', 'tokens_prompt', 'tokens_completion'].map(field => [field, value.data[field]]));
  }
  console.log('HELPER_REGEN_ACCOUNTING', JSON.stringify({ cost, reservedUSD: Number(claim[0].reserved_microusd) / 1e6,
    remainingReservableUSD: (Number(claim[0].limit_microusd) - Number(claim[0].reserved_microusd)) / 1e6 }));
}
main().catch(() => { console.error('HELPER_REGEN_FAILED: inspect accounting and Gateway logs; no automatic paid retry.'); process.exitCode = 1; });
