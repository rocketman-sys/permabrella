import assert from 'node:assert/strict';
import test from 'node:test';
import { neon } from '@neondatabase/serverless';
import { publicListingQuery } from './retrieval';

const now = new Date('2026-10-19T00:00:00Z');
const options = { skip: !process.env.DATABASE_URL };
async function fixtureQuery(query: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const compiled = publicListingQuery({ query, kind: 'site', category: 'all' }, now).toSQL();
  // Connection-local temporary table; existing listings are never written.
  const fixtures = [
    ['river', 'grant', 'River Health Grants', 'Riparian restoration and revegetation', 'tweed', 'active', null, { statusLabel: 'Rolling applications' }],
    ['metadata', 'grant', 'Community Environment Fund', 'Project support', 'other', 'active', null, { statusLabel: 'Open now', bestFor: 'biodiversity conservation', eligibleRegions: ['tweed'] }],
    ['closed', 'grant', 'Closed Regeneration Fund', 'Conservation and restoration', 'tweed', 'active', null, { statusLabel: 'Closed - track next round' }],
    ['expired', 'grant', 'Expired Regeneration Fund', 'Conservation and restoration', 'tweed', 'active', '2026-10-01', {}],
    ['removed', 'grant', 'Removed Regeneration Fund', 'Conservation and restoration', 'tweed', 'removed', null, {}],
    ['group', 'directory_entry', 'Regeneration Group', 'Conservation and restoration', 'tweed', 'active', null, {}],
    ['unrelated', 'grant', 'Arts Funding', 'Painting and theatre', 'ballina', 'active', null, { statusLabel: 'Open now' }],
  ];
  const result = await sql.transaction([
    sql.query('create temporary table posts(id text,type text,title text,description text,region text,status text,expires_at timestamp,metadata jsonb,location_detail text,external_url text,created_at timestamp default now(),updated_at timestamp default now(),event_date timestamp) on commit drop'),
    ...fixtures.map(row => sql.query('insert into posts(id,type,title,description,region,status,expires_at,metadata) values($1,$2,$3,$4,$5,$6,$7,$8)', row.map((v, i) => i === 7 ? JSON.stringify(v) : v))),
    sql.query(compiled.sql, compiled.params),
  ]);
  return result.at(-1)!.map(row => row.id);
}
test('exact user query finds related grants, including metadata-only matches, but never closed/expired/private/wrong-category records', options, async () => {
  assert.deepEqual((await fixtureQuery('what grants are available for local regen')).sort(), ['metadata', 'river']);
});
test('broad natural-language grant browsing executes valid PostgreSQL with no keyword score', options, async () => {
  assert.deepEqual((await fixtureQuery('what grants are available now')).sort(), ['metadata', 'river', 'unrelated']);
});
test('town constraints include eligible regional programs and unknown topics stay empty', options, async () => {
  assert.deepEqual((await fixtureQuery('grants for bush regeneration in Tweed')).sort(), ['metadata', 'river']);
  assert.deepEqual(await fixtureQuery('grants for zzzzunfindablezzzz'), []);
});
