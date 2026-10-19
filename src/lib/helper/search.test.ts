import assert from 'node:assert/strict';
import test from 'node:test';
import { listingSearchPlan } from './search';

const plan = (query: string, category: 'all' | 'groups' | 'grants' = 'all') => listingSearchPlan({ query, category, kind: 'site' });
test('the reported local regen query selects grants and related restoration terms', () => {
  const p = plan('what grants are available for local regen');
  assert.equal(p.category, 'grants'); assert.equal(p.groups.length, 1);
  for (const term of ['restor', 'biodiversity', 'conservation', 'riparian', 'sustainable agriculture']) assert(p.groups[0].includes(term));
});
test('grant intent wins over an activity noun; an explicit category still wins', () => {
  assert.equal(plan('funding for restoration workshops').category, 'grants');
  assert.equal(plan('grants for conservation', 'groups').category, 'groups');
});
test('category-only and conversational funding questions do not create stray predicates', () => {
  assert.deepEqual(plan('what grants are available now').groups, []);
  assert.deepEqual(plan('help me find current funding opportunities for local projects in the Northern Rivers').groups, []);
});
test('concept synonyms are alternatives, while towns and unknown terms remain constraints', () => {
  const p = plan('help me find funding opportunities for bush regeneration projects in Tweed');
  assert.equal(p.groups.length, 2); assert.deepEqual(p.groups[1], ['tweed']);
  assert.deepEqual(plan('grants for zzzzunfindablezzzz').groups, [['zzzzunfindablezzzz']]);
  assert.deepEqual(plan('SEED Northern Rivers').groups, [['seed'], ['northern'], ['rivers']]);
});
