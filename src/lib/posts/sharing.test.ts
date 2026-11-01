import assert from 'node:assert/strict';
import test from 'node:test';
import { shareListing } from './sharing';
const listing = { title: 'A community event', url: 'https://www.permabrella.org/events/example' };

test('native sharing receives only the title and canonical public link', async () => {
  let received: unknown;
  const result = await shareListing({ share: async data => { received = data; } }, listing, 'share');
  assert.equal(result, 'shared'); assert.deepEqual(received, listing);
});
test('cancelling never changes the clipboard or reports success', async () => {
  let copied = false;
  const result = await shareListing({ share: async () => { throw new DOMException('Cancelled', 'AbortError'); }, clipboard: {writeText: async () => { copied = true; }} }, listing, 'share');
  assert.equal(result, 'cancelled'); assert.equal(copied, false);
});
test('unsupported native sharing copies the public link and explicit copy bypasses share', async () => {
  const copied: string[] = [];
  const clipboard = { writeText: async (url: string) => { copied.push(url); } };
  assert.equal(await shareListing({clipboard}, listing, 'share'), 'copied');
  assert.equal(await shareListing({clipboard, share: async () => { throw Error('Must not open'); }}, listing, 'copy'), 'copied');
  assert.deepEqual(copied, [listing.url, listing.url]);
});
test('denied sharing or clipboard access offers manual copying without false success', async () => {
  assert.equal(await shareListing({}, listing, 'share'), 'manual');
  assert.equal(await shareListing({clipboard:{writeText: async () => {throw Error('Denied');}}}, listing, 'copy'), 'manual');
  assert.equal(await shareListing({share:async () => {throw new DOMException('Denied','NotAllowedError');}}, listing, 'share'), 'manual');
});
