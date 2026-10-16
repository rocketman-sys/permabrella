import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, threads, topics, users } from "@/lib/db/schema";
import type { Region } from "@/lib/regions";

import { listingVisibility } from "@/lib/posts/visibility";
import type { FreshnessPost } from "@/lib/posts/freshness";

export type SearchFilters = {
  query: string;
  region?: Region;
  topicSlug?: string;
};

export type SearchPostRow = FreshnessPost & {
  id: string;
  type: typeof posts.$inferSelect.type;
  title: string;
  description: string;
  region: typeof posts.$inferSelect.region;
  createdAt: Date;
};

export type SearchThreadRow = {
  id: string;
  title: string;
  body: string;
  region: typeof threads.$inferSelect.region;
  createdAt: Date;
  lastActivityAt: Date;
  topicSlug: string;
  topicName: string;
  authorDisplay: string | null;
};

export type GlobalSearchResults = {
  posts: SearchPostRow[];
  threads: SearchThreadRow[];
};

function authorLabel(
  displayName: string | null,
  username: string | null
): string | null {
  if (displayName?.trim()) return displayName.trim();
  if (username?.trim()) return username.trim();
  return null;
}

export async function runGlobalSearch(
  filters: SearchFilters
): Promise<GlobalSearchResults> {
  const q = filters.query.trim();

  const like = `%${q}%`;
  const postConditions: SQL[] = [listingVisibility()];
  const threadConditions: SQL[] = [];
  if (q) {
    postConditions.push(or(ilike(posts.title, like), ilike(posts.description, like), ilike(posts.locationDetail, like))!);
    threadConditions.push(or(ilike(threads.title, like), ilike(threads.body, like))!);
  }

  if (filters.region) {
    postConditions.push(eq(posts.region, filters.region));
    threadConditions.push(eq(threads.region, filters.region));
  }

  if (filters.topicSlug) {
    threadConditions.push(eq(topics.slug, filters.topicSlug));
  }

  const [postRows, threadRows] = await Promise.all([
    db
      .select({
        id: posts.id,
        type: posts.type,
        title: posts.title,
        description: posts.description,
        region: posts.region,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        status: posts.status,
        eventDate: posts.eventDate,
        expiresAt: posts.expiresAt,
        metadata: posts.metadata,
      })
      .from(posts)
      .where(and(...postConditions))
      .orderBy(desc(posts.createdAt))
      .limit(40),
    db
      .select({
        id: threads.id,
        title: threads.title,
        body: threads.body,
        region: threads.region,
        createdAt: threads.createdAt,
        lastActivityAt: threads.lastActivityAt,
        topicSlug: topics.slug,
        topicName: topics.name,
        displayName: users.displayName,
        username: users.username,
      })
      .from(threads)
      .innerJoin(topics, eq(threads.topicId, topics.id))
      .innerJoin(users, eq(threads.authorId, users.id))
      .where(and(...threadConditions))
      .orderBy(desc(threads.lastActivityAt))
      .limit(40),
  ]);

  return {
    posts: postRows,
    threads: threadRows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      region: r.region,
      createdAt: r.createdAt,
      lastActivityAt: r.lastActivityAt,
      topicSlug: r.topicSlug,
      topicName: r.topicName,
      authorDisplay: authorLabel(r.displayName, r.username),
    })),
  };
}
