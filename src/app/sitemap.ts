import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, threads, topics } from "@/lib/db/schema";
import { SITE_ORIGIN } from "@/lib/site";
import { listingVisibility } from "@/lib/posts/visibility";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, discussions, topicRows] = await Promise.all([
    db.select({ id: posts.id, type: posts.type, updatedAt: posts.updatedAt }).from(posts).where(listingVisibility()).limit(10000),
    db.select({ id: threads.id, slug: topics.slug, updatedAt: threads.lastActivityAt }).from(threads).innerJoin(topics, eq(threads.topicId, topics.id)).limit(10000),
    db.select({ slug: topics.slug }).from(topics),
  ]);
  const base = { event: "events", offering: "offerings", wanted: "offerings", land_available: "land-connect", land_wanted: "land-connect", directory_entry: "directory", grant: "grants", news: "news" };
  return [
    ...["", "/events", "/offerings", "/land-connect", "/directory", "/grants", "/community", "/news", "/how-it-works", "/helper"].map((path) => ({ url: `${SITE_ORIGIN}${path}`, priority: path ? 0.7 : 1 })),
    ...listings.map((p) => ({ url: `${SITE_ORIGIN}/${base[p.type]}/${p.id}`, lastModified: p.updatedAt })),
    ...topicRows.map((t) => ({ url: `${SITE_ORIGIN}/community/${t.slug}` })),
    ...discussions.map((t) => ({ url: `${SITE_ORIGIN}/community/${t.slug}/${t.id}`, lastModified: t.updatedAt })),
  ];
}
