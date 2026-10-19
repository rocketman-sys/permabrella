import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { ACTIVITY_WINDOW_MS } from "./activity";

/** The same public message source used by thread detail and activity summaries.
 * This schema has no private-message or soft-deletion state. Deleted rows are
 * absent; messages without a visible author are excluded by the existing join.
 * Keep any future moderation/visibility predicate here for both consumers.
 */
export function publicMessagesQuery() {
  return db.select({ message: messages, displayName: users.displayName, username: users.username })
    .from(messages).innerJoin(users, eq(messages.authorId, users.id));
}

export function publicReplyStats(now: Date) {
  const visible = publicMessagesQuery().as("public_messages");
  const cutoff = new Date(now.getTime() - ACTIVITY_WINDOW_MS);
  const recent = sql`${visible.message.createdAt} > ${cutoff.toISOString()}::timestamp and ${visible.message.createdAt} <= ${now.toISOString()}::timestamp`;
  return db.select({
    threadId: visible.message.threadId,
    totalReplyCount: sql<number>`count(*)::integer`.as("total_reply_count"),
    lastReplyAt: sql<Date | null>`max(${visible.message.createdAt}) filter (where ${visible.message.createdAt} <= ${now.toISOString()}::timestamp)`
      .mapWith((value): Date | null => value === null ? null : messages.createdAt.mapFromDriverValue(value) as Date).as("last_reply_at"),
    recentReplyTimes: sql<number[]>`coalesce(json_agg(extract(epoch from ${visible.message.createdAt}) * 1000) filter (where ${recent}), '[]'::json)`
      .as("recent_reply_times"),
  }).from(visible).groupBy(visible.message.threadId).as("reply_activity");
}
