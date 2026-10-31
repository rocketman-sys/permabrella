import assert from "node:assert/strict";
import test from "node:test";
import catalog from "../../../data/grant-applicants.json";
import { grantApplicants, grantFundingStatus, matchesGrantFilters, parseGrantFilters } from "./grant-filters";
import type { FreshnessPost } from "./freshness";

const now = new Date("2026-11-01T01:00:00Z");
const base: FreshnessPost & { id: string } = {
  id: "unclassified", type: "grant", status: "active", eventDate: null, expiresAt: null,
  createdAt: now, updatedAt: now, metadata: {},
};
test("funding filters preserve closed, upcoming, rolling and unknown distinctions", () => {
  for (const [label, expected] of [
    ["Open now", "open"], ["Rolling applications", "rolling"],
    ["Upcoming - check opening", "upcoming"], ["Closed - track next round", "closed"],
    ["Ongoing resource", "resource"], ["Check current round", "check"],
  ]) assert.equal(grantFundingStatus({ ...base, metadata: { statusLabel: label } }, now), expected);
  assert.equal(grantFundingStatus({ ...base, expiresAt: new Date("2026-11-02T01:00:00Z") }, now), "check", "A deadline alone does not prove an open round");
  assert.equal(grantFundingStatus({ ...base, expiresAt: now, metadata: { statusLabel: "Open now" } }, now), "closed");
});
test("default results exclude resources, closed rounds and unpublished posts", () => {
  const filters = parseGrantFilters({});
  for (const post of [
    { ...base, metadata: { statusLabel: "Ongoing resource" } },
    { ...base, metadata: { statusLabel: "Closed - track next round" } },
    { ...base, status: "expired" as const }, { ...base, status: "pending_moderation" as const },
  ]) assert.equal(matchesGrantFilters(post, filters, now), false);
  assert.equal(matchesGrantFilters(base, filters, now), true);
  assert.equal(matchesGrantFilters({ ...base, status: "expired" }, { ...filters, funding: "closed" }, now), true);
});
test("reviewed applicant categories require unchanged eligibility text", () => {
  const entry = catalog.entries.find((entry) => entry.applicants.length > 1)!;
  const post = { ...base, id: entry.id, metadata: { whoCanApply: entry.eligibility, statusLabel: "Open now" } };
  assert.deepEqual(grantApplicants(post), entry.applicants);
  assert.equal(matchesGrantFilters(post, { applicant: "individual", funding: "open" }, now), true);
  assert.equal(matchesGrantFilters(post, { applicant: "individual", funding: "rolling" }, now), false);
  assert.deepEqual(grantApplicants({ ...post, metadata: { ...post.metadata, whoCanApply: "Individuals are no longer eligible." } }), []);
  assert.equal(matchesGrantFilters(base, { applicant: "unknown", funding: "all" }, now), true);
  assert.equal(matchesGrantFilters(base, { applicant: "community", funding: "all" }, now), false);
});
test("invalid and repeated parameters are safe and previous past links still work", () => {
  assert.deepEqual(parseGrantFilters({ applicant: ["individual", "community"], funding: "bad" }), { applicant: "all", funding: "all" });
  assert.equal(parseGrantFilters({ view: "past" }).funding, "closed");
  assert.equal(parseGrantFilters({ view: "past", funding: "rolling" }).funding, "rolling");
});
