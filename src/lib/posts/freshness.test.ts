import assert from "node:assert/strict";
import test from "node:test";
import { parseSydneyDateTime, sydneyDayStart } from "./dates";
import { isPastListing, listingFreshness, type FreshnessPost } from "./freshness";
import { listingVisibility } from "./visibility";
import { PgDialect } from "drizzle-orm/pg-core";
const now = new Date("2026-10-17T01:00:00Z");
const base: FreshnessPost = { type: "event", status: "active", eventDate: null, expiresAt: null, metadata: {}, createdAt: new Date("2026-04-22T00:00:00Z"), updatedAt: new Date("2026-04-22T00:00:00Z") };
test("Northern Rivers dates use standard and daylight-saving time", () => {
  assert.equal(parseSydneyDateTime("2026-07-01T10:30")?.toISOString(), "2026-07-01T00:30:00.000Z");
  assert.equal(parseSydneyDateTime("2026-10-17T10:30")?.toISOString(), "2026-10-16T23:30:00.000Z");
  assert.equal(sydneyDayStart(now).toISOString(), "2026-10-16T13:00:00.000Z");
});
test("invalid dates and nonexistent daylight-saving times are rejected", () => {
  for (const value of ["2026-02-30T10:00", "2026-13-01T10:00", "2026-10-04T02:30", "not-a-date"]) assert.equal(parseSydneyDateTime(value), null);
  assert.equal(sydneyDayStart(new Date("2026-10-04T08:00:00Z")).toISOString(), "2026-10-03T14:00:00.000Z");
});
test("today's event stays visible all day in Sydney", () => {
  assert.equal(isPastListing({...base,eventDate:new Date("2026-10-16T14:00:00Z")},now),false);
  assert.equal(isPastListing({...base,eventDate:new Date("2026-10-16T12:59:00Z")},now),true);
});
test("unknown dates and stale listings never imply verified availability", () => {
  assert.equal(listingFreshness(base,now).label,"Date to be arranged");
  assert.equal(listingFreshness({...base,type:"grant"},now).label,"Check current round");
  assert.equal(listingFreshness({...base,type:"land_available"},now).label,"Confirm availability");
});
test("deadline closes at the exact instant and explicitly closed rounds stay archived", () => {
  assert.equal(isPastListing({...base,type:"grant",expiresAt:now},now),true);
  assert.equal(isPastListing({...base,type:"grant",expiresAt:new Date(now.getTime()+1)},now),false);
  assert.equal(isPastListing({...base,type:"grant",metadata:{statusLabel:"Closed - track next round"}},now),true);
  assert.equal(isPastListing({...base,type:"grant",status:"expired"},now),true);
});
test("funding directories aren't presented as open grant rounds", () => {
  assert.equal(listingFreshness({...base,type:"grant",metadata:{statusLabel:"Ongoing resource"}},now).label,"Funding directory");
});
test("date-only deadlines show the published date and ask users to confirm the time", () => {
  const post: FreshnessPost = { ...base, type: "grant", expiresAt: parseSydneyDateTime("2026-11-02T00:00"), metadata: { deadlineDate: "2026-11-01" } };
  assert.match(listingFreshness(post, now).note, /1 Nov 2026/);
  assert.match(listingFreshness(post, now).note, /Confirm the closing time/);
  assert.equal(isPastListing(post, new Date("2026-11-01T13:00:00Z")), true);
});
test("database filters bind timezone-correct boundaries and exclude unpublished posts", () => {
  const dialect = new PgDialect();
  const current=dialect.sqlToQuery(listingVisibility("current",now));
  const past=dialect.sqlToQuery(listingVisibility("past",now));
  assert.ok(current.params.includes("active"));
  assert.ok(current.params.includes("2026-10-16T13:00:00.000Z"));
  assert.ok(past.params.includes("expired"));
  assert.ok(!past.params.includes("pending_moderation"));
  assert.match(current.sql,/coalesce/);
});
