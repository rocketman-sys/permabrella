import assert from 'node:assert/strict';
import test from 'node:test';
import { answerHelper } from './answer';
import { generateAnswer } from './provider';
import type { HelperInput, HelperSource } from './policy';

const input: HelperInput = { query: 'Mullumbimby garden', kind: 'site', category: 'groups' };
const source: HelperSource = { id: 'garden', title: 'Garden', href: '/directory/garden', excerpt: 'A public garden.', region: 'Mullumbimby', verification: 'Community listing', note: '', freshness: '', updated: '2026-10-19', sourceUrls: [] };

function harness(options: {
  enabled?: boolean; anonymous?: boolean; sources?: HelperSource[];
  budget?: 'active' | 'exhausted' | 'paused' | 'expired' | 'hourly-limit';
  error?: 'auth' | 'budget' | 'provider' | 'retrieval';
} = {}) {
  const calls: string[] = [];
  const accounting = { reserved: 0, providerRequests: 0 };
  const deps = {
    aiEnabled: () => options.enabled ?? true,
    retrieve: async (question: HelperInput) => {
      calls.push('retrieve'); assert.deepEqual(question, input);
      if (options.error === 'retrieval') throw Error('Database unavailable');
      return options.sources ?? [source];
    },
    currentUserId: async () => {
      calls.push('auth');
      if (options.error === 'auth') throw Error('Session unavailable');
      return options.anonymous ? null : 'reviewer';
    },
    reserve: async (userId: string) => {
      calls.push('reserve'); assert.equal(userId, 'reviewer');
      if (options.error === 'budget') throw Error('Budget unavailable');
      if (options.budget && options.budget !== 'active') return false;
      accounting.reserved += 10_000;
      return true;
    },
    generate: async (question: HelperInput, sources: HelperSource[]) => {
      calls.push('generate');
      const fetcher = (async (_url, init) => {
        accounting.providerRequests++;
        const body = JSON.parse(String(init?.body));
        assert.equal(body.messages.length, 2);
        assert.equal(JSON.parse(body.messages[1].content).question, question.query);
        assert.equal(accounting.reserved, 10_000, 'reserve before the single provider request');
        if (options.error === 'provider') return new Response('{}', { status: 503 });
        return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({
          answer: 'A mocked answer.', sourceIds: question.kind === 'site' ? [source.id] : [],
        }) } }] });
      }) as typeof fetch;
      return generateAnswer(question, sources, 'mock-key-never-used-on-network', fetcher);
    },
  };
  return { deps, calls, accounting };
}

function assertLookup(result: Awaited<ReturnType<typeof answerHelper>>, notice: RegExp, sources = [source]) {
  assert.equal(result.status, 200);
  assert.ok('sources' in result.body);
  assert.equal(result.body.generated, false);
  assert.deepEqual(result.body.sources, sources);
  assert.match(result.body.notice, notice);
  return result.body;
}

test('AI-off local search returns listings without authentication, budget or provider work', async () => {
  const h = harness({ enabled: false });
  assertLookup(await answerHelper(input, h.deps), /no AI-generated answer/);
  assert.deepEqual(h.calls, ['retrieve']);
  assert.deepEqual(h.accounting, { reserved: 0, providerRequests: 0 });
});

test('AI-enabled anonymous local search returns listings and optional sign-in guidance', async () => {
  const h = harness({ anonymous: true });
  assertLookup(await answerHelper(input, h.deps), /Sign in if you would also like an AI summary/);
  assert.deepEqual(h.calls, ['retrieve', 'auth']);
  assert.deepEqual(h.accounting, { reserved: 0, providerRequests: 0 });
});

for (const budget of ['exhausted', 'paused', 'expired', 'hourly-limit'] as const) {
  test(`signed-in local search keeps listings when the AI budget is ${budget}`, async () => {
    const h = harness({ budget });
    assertLookup(await answerHelper(input, h.deps), /AI summaries are currently paused or the preview allowance has been reached/);
    assert.deepEqual(h.calls, ['retrieve', 'auth', 'reserve']);
    assert.deepEqual(h.accounting, { reserved: 0, providerRequests: 0 });
  });
}

test('provider failure returns listings and keeps the full reservation without retrying', async () => {
  const h = harness({ error: 'provider' });
  assertLookup(await answerHelper(input, h.deps), /AI summary is unavailable/);
  assert.deepEqual(h.calls, ['retrieve', 'auth', 'reserve', 'generate']);
  assert.deepEqual(h.accounting, { reserved: 10_000, providerRequests: 1 });
});

test('normal generation still requires authentication and reservation, then returns validated citations', async () => {
  const h = harness();
  const result = await answerHelper(input, h.deps);
  assert.equal(result.status, 200);
  assert.ok('sources' in result.body);
  assert.equal(result.body.generated, true);
  assert.equal(result.body.answer, 'A mocked answer.');
  assert.deepEqual(result.body.sources, [source]);
  assert.deepEqual(h.calls, ['retrieve', 'auth', 'reserve', 'generate']);
  assert.deepEqual(h.accounting, { reserved: 10_000, providerRequests: 1 });
});

test('no local matches skips authentication and all paid work even with AI enabled', async () => {
  const h = harness({ sources: [] });
  const reply = assertLookup(await answerHelper(input, h.deps), /no AI-generated answer/, []);
  assert.match(reply.answer, /does not mean no local option exists/);
  assert.deepEqual(h.calls, ['retrieve']);
});

for (const error of ['auth', 'budget'] as const) {
  test(`${error} service failure preserves local results without attempting generation`, async () => {
    const h = harness({ error });
    assertLookup(await answerHelper(input, h.deps), /AI summary is unavailable/);
    assert.equal(h.calls.includes('generate'), false);
    assert.deepEqual(h.accounting, { reserved: 0, providerRequests: 0 });
  });
}

test('oversized AI context preserves listing search and never reserves an allowance', async () => {
  const oversized = [{ ...source, excerpt: 'x'.repeat(30_000) }];
  const h = harness({ sources: oversized });
  assertLookup(await answerHelper(input, h.deps), /AI summary is unavailable/, oversized);
  assert.deepEqual(h.calls, ['retrieve', 'auth']);
});

test('general permaculture guidance retains its access gates and never retrieves local listings', async () => {
  const general: HelperInput = { ...input, kind: 'general' };
  for (const [options, status] of [
    [{ enabled: false }, 200], [{ anonymous: true }, 401], [{ budget: 'paused' as const }, 429],
    [{ error: 'budget' as const }, 503], [{ error: 'provider' as const }, 200], [{}, 200],
  ] as const) {
    const h = harness(options);
    const result = await answerHelper(general, h.deps);
    assert.equal(result.status, status);
    assert.equal(h.calls.includes('retrieve'), false);
    if ('sources' in result.body) {
      assert.deepEqual(result.body.sources, []);
      assert.equal(result.body.generated, Object.keys(options).length === 0);
    }
    if (status !== 200 || 'enabled' in options) assert.equal(h.accounting.providerRequests, 0);
  }
});

test('retrieval failures remain real search failures and do not trigger AI', async () => {
  const h = harness({ error: 'retrieval' });
  await assert.rejects(answerHelper(input, h.deps), /Database unavailable/);
  assert.deepEqual(h.calls, ['retrieve']);
});
