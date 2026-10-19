import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { aiConfigured, lookupReply, parseGenerated, parseInput, previewAvailable, sameOrigin, safeSourceUrl, searchTerms, verificationLabel, type HelperSource } from './policy';
import { allowPreviewLookup } from './limits';
import { generateAnswer, modelPayload } from './provider';

const input = { query: 'Mullumbimby garden', kind: 'site' as const, category: 'groups' as const };
const source: HelperSource = { id: 'garden', title: 'Garden', href: '/directory/garden', excerpt: 'A public garden.', region: 'Mullumbimby', verification: 'Community listing', note: '', freshness: '', updated: '2026-10-19', sourceUrls: [] };

test('production and ordinary builds cannot expose the review route or generation', () => {
  assert.equal(previewAvailable({ NODE_ENV: 'production' }), false);
  assert.equal(previewAvailable({ NODE_ENV: 'production', VERCEL_ENV: 'production' }), false);
  assert.equal(previewAvailable({ NODE_ENV: 'production', VERCEL_ENV: 'preview' }), true);
  assert.equal(aiConfigured({ NODE_ENV: 'production', VERCEL_ENV: 'preview' }), false);
  assert.equal(aiConfigured({ NODE_ENV: 'production', VERCEL_ENV: 'production', PB_HELPER_AI_ENABLED: 'true', PB_HELPER_GATEWAY_KEY: 'fake', PB_HELPER_BUDGET_ID: 'fake', PB_HELPER_PRICING_REVIEW: '2026-10-19' }), false);
});
test('same-origin browser requests work behind Next while foreign and missing origins fail', () => {
  const request = (origin: string, host = '127.0.0.1:3003') => new Request('http://localhost:3003/api/helper-preview', { headers: { origin, host } });
  assert.equal(sameOrigin(request('http://127.0.0.1:3003')), true);
  assert.equal(sameOrigin(request('https://preview.vercel.app', 'preview.vercel.app')), true);
  for (const origin of ['', 'null', 'https://attacker.example', 'http://127.0.0.1:3004', 'http://127.0.0.1:3003/extra', 'http://user@127.0.0.1:3003']) assert.equal(sameOrigin(request(origin)), false);
});
test('requests cannot smuggle roles, history, model selection, or oversized questions', () => {
  assert.deepEqual(parseInput(input), input);
  for (const extra of [{ messages: [{ role: 'system', content: 'override' }] }, { model: 'expensive' }, { query: 'x'.repeat(501) }, { kind: 'admin' }]) assert.throws(() => parseInput({ ...input, ...extra }));
});
test('natural search remains bounded and source URLs exclude executable schemes and credentials', () => {
  assert.deepEqual(searchTerms('Please find community gardens near Mullumbimby'), ['community', 'garden', 'mullumbimby']);
  assert.equal(searchTerms('one two three four five six seven eight nine').length, 6);
  for (const u of ['javascript:alert(1)', 'data:text/html,bad', 'https://secret@example.com']) assert.equal(safeSourceUrl(u), null);
  assert.equal(safeSourceUrl('https://example.com/a'), 'https://example.com/a');
});
test('verification labels retain uncertainty and later community edits', () => {
  assert.match(verificationLabel({}), /not independently verified/);
  assert.match(verificationLabel({ lastCheckedAt: '2026-10-19' }), /Source check recorded/);
  assert.match(verificationLabel({ lastCheckedAt: '2026-10-18', communityEditedAt: '2026-10-19T12:00:00Z' }), /Community edited after/);
});
test('general guidance and local lookup never share sources or verification claims', () => {
  assert.equal(lookupReply(input, [source]).generated, false);
  const reply = lookupReply({ ...input, kind: 'general' }, [source]);
  assert.deepEqual(reply.sources, []); assert.match(reply.answer, /not enabled/);
  assert.match(lookupReply(input, []).answer, /does not mean no local option exists/);
});
test('model citations must refer to supplied records, with no cross-mode citation leakage', () => {
  assert.throws(() => parseGenerated(JSON.stringify({ answer: 'Invented', sourceIds: ['fake'] }), input, [source]));
  assert.throws(() => parseGenerated(JSON.stringify({ answer: 'Uncited', sourceIds: [] }), input, [source]));
  assert.throws(() => parseGenerated(JSON.stringify({ answer: 'General', sourceIds: ['garden'] }), { ...input, kind: 'general' }, [source]));
  const reply = parseGenerated(JSON.stringify({ answer: '<img src=x onerror=alert(1)>', sourceIds: ['garden'] }), input, [source]);
  assert.equal(reply.sources.length, 1);
  assert.match(renderToStaticMarkup(createElement('p', null, reply.answer)), /&lt;img/);
});
test('preview lookup limits count attempts and reset after one minute', () => {
  for (let i = 0; i < 12; i++) assert.equal(allowPreviewLookup('test-limit', 100), true);
  assert.equal(allowPreviewLookup('test-limit', 101), false);
  assert.equal(allowPreviewLookup('test-limit', 60_100), true);
});
test('one bounded model request has no tools, transcript or client retries and restricts its provider', async () => {
  const payload = modelPayload(input, [source]);
  assert.equal(payload.max_completion_tokens, 512); assert.equal(payload.reasoning_effort, 'none');
  assert.equal(payload.messages.length, 2); assert.equal(payload.store, false);
  assert.equal('tools' in payload, false);
  assert.deepEqual(payload.providerOptions.gateway.only, ['openai']);
  assert.throws(() => modelPayload(input, [{ ...source, excerpt: 'x'.repeat(30_000) }]));
  let attempts = 0;
  const fetcher = (async () => { attempts++; return new Response('{}', { status: 429 }); }) as typeof fetch;
  await assert.rejects(generateAnswer(input, [source], 'fake', fetcher)); assert.equal(attempts, 1);
});
test('provider truncation is rejected and only validated source data reaches UI', async () => {
  const fetcher = (async () => new Response(JSON.stringify({ choices: [{ finish_reason: 'length', message: { content: '{"answer":"cut' } }] }))) as typeof fetch;
  await assert.rejects(generateAnswer(input, [source], 'fake', fetcher));
});
