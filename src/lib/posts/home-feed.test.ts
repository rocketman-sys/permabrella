import assert from "node:assert/strict";
import test from "node:test";
import { isHomepageOpportunity } from "./home-feed";
import type { FreshnessPost } from "./freshness";

const now = new Date("2026-11-01T01:00:00Z");
const listing: FreshnessPost = {
  type: "offering", status: "active", eventDate: null, expiresAt: null,
  createdAt: new Date("2026-10-31T01:00:00Z"), updatedAt: new Date("2026-10-31T01:00:00Z"), metadata: {},
};

test("recent published exchanges and land requests can appear on the homepage", () => {
  for (const type of ["offering", "wanted", "land_available", "land_wanted"] as const) assert.equal(isHomepageOpportunity({ ...listing, type }, now), true);
});

test("closed, unpublished and stale opportunities are not promoted", () => {
  for (const status of ["expired", "removed", "pending_moderation"] as const) assert.equal(isHomepageOpportunity({ ...listing, status }, now), false);
  assert.equal(isHomepageOpportunity({ ...listing, expiresAt: now }, now), false);
  assert.equal(isHomepageOpportunity({ ...listing, updatedAt: new Date("2026-01-01") }, now), false);
});

test("dated job adverts and unconfirmed community leads stay off the homepage", () => {
  for (const metadata of [
    { advertisedStartDate: "2026-10-26" },
    { communityEdited: true },
    { verificationNote: "Confirm the owner's current need." },
    { listingLabel: "Community lead · availability unconfirmed" },
    { landConnectCategory: "lead" },
    { landConnectCategory: "resource" },
  ]) assert.equal(isHomepageOpportunity({ ...listing, type: "land_wanted", metadata }, now), false);
});
