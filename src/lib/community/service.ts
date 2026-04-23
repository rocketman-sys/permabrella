import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  messages,
  subscriptions,
  threads,
  topics,
  users,
} from "@/lib/db/schema";
import type { Region } from "@/lib/regions";
import { resolveAuthorBadge, type AuthorBadge } from "./authorship";

function authorLabel(
  displayName: string | null,
  username: string | null
): string | null {
  if (displayName?.trim()) return displayName.trim();
  if (username?.trim()) return username.trim();
  return null;
}

export async function listTopicsOrdered() {
  return db
    .select()
    .from(topics)
    .orderBy(asc(topics.sortOrder), asc(topics.name));
}

export async function getTopicBySlug(slug: string) {
  const rows = await db
    .select()
    .from(topics)
    .where(eq(topics.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export type ThreadListRow = {
  thread: typeof threads.$inferSelect;
  authorDisplay: string | null;
  authorBadge: AuthorBadge | null;
};

export async function listThreadsForTopic(
  topicId: string,
  region?: Region | null
): Promise<ThreadListRow[]> {
  const conditions = [eq(threads.topicId, topicId)];
  if (region) {
    conditions.push(eq(threads.region, region));
  }

  const rows = await db
    .select({
      thread: threads,
      displayName: users.displayName,
      username: users.username,
    })
    .from(threads)
    .innerJoin(users, eq(threads.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(threads.isPinned), desc(threads.lastActivityAt));

  return rows.map((r) => ({
    thread: r.thread,
    authorDisplay: authorLabel(r.displayName, r.username),
    authorBadge: resolveAuthorBadge(r.username, r.displayName),
  }));
}

export type ThreadDetail = {
  thread: typeof threads.$inferSelect;
  topic: typeof topics.$inferSelect;
  authorDisplay: string | null;
  authorBadge: AuthorBadge | null;
};

export async function getThreadInTopic(
  threadId: string,
  topicSlug: string
): Promise<ThreadDetail | null> {
  const rows = await db
    .select({
      thread: threads,
      topic: topics,
      displayName: users.displayName,
      username: users.username,
    })
    .from(threads)
    .innerJoin(topics, eq(threads.topicId, topics.id))
    .innerJoin(users, eq(threads.authorId, users.id))
    .where(and(eq(threads.id, threadId), eq(topics.slug, topicSlug)))
    .limit(1);

  if (!rows.length) return null;
  const r = rows[0];
  return {
    thread: r.thread,
    topic: r.topic,
    authorDisplay: authorLabel(r.displayName, r.username),
    authorBadge: resolveAuthorBadge(r.username, r.displayName),
  };
}

export type MessageRow = {
  message: typeof messages.$inferSelect;
  authorDisplay: string | null;
  authorBadge: AuthorBadge | null;
};

export async function listMessagesForThread(
  threadId: string
): Promise<MessageRow[]> {
  const rows = await db
    .select({
      message: messages,
      displayName: users.displayName,
      username: users.username,
    })
    .from(messages)
    .innerJoin(users, eq(messages.authorId, users.id))
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.createdAt));

  return rows.map((r) => ({
    message: r.message,
    authorDisplay: authorLabel(r.displayName, r.username),
    authorBadge: resolveAuthorBadge(r.username, r.displayName),
  }));
}

export async function createThread(input: {
  authorId: string;
  topicId: string;
  title: string;
  body: string;
  region?: Region | null;
}): Promise<string> {
  const [row] = await db
    .insert(threads)
    .values({
      topicId: input.topicId,
      authorId: input.authorId,
      title: input.title.trim(),
      body: input.body.trim(),
      region: input.region ?? null,
    })
    .returning({ id: threads.id });

  await db
    .update(topics)
    .set({
      threadCount: sql`${topics.threadCount} + 1`,
    })
    .where(eq(topics.id, input.topicId));

  await db
    .insert(subscriptions)
    .values({ userId: input.authorId, threadId: row.id })
    .onConflictDoNothing({
      target: [subscriptions.userId, subscriptions.threadId],
    });

  return row.id;
}

export async function createReply(input: {
  authorId: string;
  threadId: string;
  body: string;
}): Promise<{ id: string } | { error: "locked" }> {
  const t = await db
    .select({ isLocked: threads.isLocked })
    .from(threads)
    .where(eq(threads.id, input.threadId))
    .limit(1);

  if (!t.length) {
    throw new Error("Thread not found");
  }
  if (t[0].isLocked) {
    return { error: "locked" };
  }

  const [msg] = await db
    .insert(messages)
    .values({
      threadId: input.threadId,
      authorId: input.authorId,
      body: input.body.trim(),
    })
    .returning({ id: messages.id });

  await db
    .update(threads)
    .set({
      replyCount: sql`${threads.replyCount} + 1`,
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(threads.id, input.threadId));

  return { id: msg.id };
}

export async function isUserSubscribed(
  userId: string,
  threadId: string
): Promise<boolean> {
  const rows = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.threadId, threadId)
      )
    )
    .limit(1);
  return rows.length > 0;
}

export async function setUserSubscription(
  userId: string,
  threadId: string,
  subscribed: boolean
): Promise<void> {
  if (subscribed) {
    await db
      .insert(subscriptions)
      .values({ userId, threadId })
      .onConflictDoNothing({
        target: [subscriptions.userId, subscriptions.threadId],
      });
  } else {
    await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.threadId, threadId)
        )
      );
  }
}

/** Subscribers to notify (excluding `exceptUserId`) with email on file. */
export async function listNotificationRecipients(
  threadId: string,
  exceptUserId: string
) {
  return db
    .select({
      email: users.email,
      userId: users.id,
      emailNotifications: users.emailNotifications,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        eq(subscriptions.threadId, threadId),
        ne(users.id, exceptUserId),
        eq(users.emailNotifications, true)
      )
    );
}

export async function getUserDisplayForEmail(userId: string): Promise<string> {
  const rows = await db
    .select({
      displayName: users.displayName,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!rows.length) return "Someone";
  return (
    authorLabel(rows[0].displayName, rows[0].username) ?? rows[0].username
  );
}
