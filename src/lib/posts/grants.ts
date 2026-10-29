import { and, eq, gt, lte, or, sql } from "drizzle-orm";
import { posts } from "@/lib/db/schema";
import type { Region } from "@/lib/regions";
import { listingVisibility } from "./visibility";

/** Includes grants serving this town, even when their provider is elsewhere. */
export function grantRegionVisibility(region: Region) {
  return or(
    eq(posts.region, region),
    sql`${posts.metadata}->'eligibleRegions' @> ${JSON.stringify([region])}::jsonb`,
  )!;
}

/** A rolling 30-day window; only source-checked deadlines are highlighted. */
export function grantsClosingSoonVisibility(now = new Date()) {
  const through = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return and(
    eq(posts.type, "grant"),
    listingVisibility("current", now),
    gt(posts.expiresAt, now),
    lte(posts.expiresAt, through),
    sql`${posts.metadata}->>'deadlineConfirmed' = 'true'`,
    sql`coalesce(${posts.metadata}->>'statusLabel', '') not in ('Ongoing resource', 'Upcoming - check opening')`,
  )!;
}
