import { and, eq, gt, gte, inArray, isNull, lt, lte, ne, or, sql } from "drizzle-orm";
import { posts } from "@/lib/db/schema";
import { sydneyDayStart } from "./dates";

export function listingVisibility(view: "current" | "past" = "current", now = new Date()) {
  const closedGrant = and(eq(posts.type, "grant"), sql`${posts.metadata}->>'statusLabel' = 'Closed - track next round'`)!;
  if (view === "past") return and(
    inArray(posts.status, ["active", "expired"]),
    or(eq(posts.status, "expired"), lte(posts.expiresAt, now), and(eq(posts.type, "event"), lt(posts.eventDate, sydneyDayStart(now))), closedGrant),
  )!;
  return and(
    eq(posts.status, "active"),
    or(isNull(posts.expiresAt), gt(posts.expiresAt, now)),
    or(ne(posts.type, "event"), isNull(posts.eventDate), gte(posts.eventDate, sydneyDayStart(now))),
    sql`not (${posts.type} = 'grant' and coalesce(${posts.metadata}->>'statusLabel', '') = 'Closed - track next round')`,
  )!;
}
