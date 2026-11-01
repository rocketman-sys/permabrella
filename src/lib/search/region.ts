import { and, eq, or } from "drizzle-orm";
import { posts } from "@/lib/db/schema";
import { grantRegionVisibility } from "@/lib/posts/grants";
import type { Region } from "@/lib/regions";

/** Grants may serve a town even when their provider is based elsewhere. */
export function searchPostRegionVisibility(region: Region) {
  return or(
    eq(posts.region, region),
    and(eq(posts.type, "grant"), grantRegionVisibility(region)),
  )!;
}
