import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";

type PostRow = typeof posts.$inferSelect;
type PostType = PostRow["type"];
type PostSource = PostRow["source"];
type Region = NonNullable<PostRow["region"]>;

export type PostWithAuthor = {
  post: typeof posts.$inferSelect;
  authorDisplay: string | null;
};

function authorLabel(
  displayName: string | null,
  username: string | null
): string | null {
  if (displayName?.trim()) return displayName.trim();
  if (username?.trim()) return username.trim();
  return null;
}

export async function listPostsByType(options: {
  type: PostType;
  region?: Region | null;
  limit?: number;
}): Promise<PostWithAuthor[]> {
  const limit = Math.min(options.limit ?? 60, 100);
  const conditions = [eq(posts.type, options.type), eq(posts.status, "active")];
  if (options.region) {
    conditions.push(eq(posts.region, options.region));
  }

  const orderBy = [desc(posts.createdAt)];

  const rows = await db
    .select({
      post: posts,
      displayName: users.displayName,
      username: users.username,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(limit);

  return rows.map((r) => ({
    post: r.post,
    authorDisplay: authorLabel(r.displayName, r.username),
  }));
}

export async function getActivePostById(
  id: string,
  type: PostType
): Promise<PostWithAuthor | null> {
  const rows = await db
    .select({
      post: posts,
      displayName: users.displayName,
      username: users.username,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(
      and(eq(posts.id, id), eq(posts.type, type), eq(posts.status, "active"))
    )
    .limit(1);

  if (!rows.length) return null;
  const r = rows[0];
  return {
    post: r.post,
    authorDisplay: authorLabel(r.displayName, r.username),
  };
}

export async function createUserPost(input: {
  authorId: string;
  type: PostType;
  title: string;
  description: string;
  contactMethod?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  externalUrl?: string | null;
  imageUrl?: string | null;
  region?: Region | null;
  locationDetail?: string | null;
  eventDate?: Date | null;
}): Promise<string> {
  const [row] = await db
    .insert(posts)
    .values({
      type: input.type,
      status: "active",
      source: "direct",
      title: input.title.trim(),
      description: input.description.trim(),
      contactMethod: input.contactMethod?.trim() || null,
      contactPhone: input.contactPhone?.trim() || null,
      contactEmail: input.contactEmail?.trim() || null,
      externalUrl: input.externalUrl?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      region: input.region ?? null,
      locationDetail: input.locationDetail?.trim() || null,
      eventDate: input.eventDate ?? null,
      authorId: input.authorId,
    })
    .returning({ id: posts.id });

  return row.id;
}

export async function upsertImportedEvent(input: {
  externalId: string;
  source: Extract<PostSource, "eventbrite" | "humanitix">;
  title: string;
  description: string;
  eventDate: Date | null;
  externalUrl: string;
  imageUrl: string | null;
  locationDetail: string | null;
  region: Region | null;
  metadata: Record<string, unknown>;
}): Promise<"inserted" | "updated"> {
  const existing = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.externalId, input.externalId),
        eq(posts.source, input.source)
      )
    )
    .limit(1);

  const now = new Date();

  if (existing.length) {
    await db
      .update(posts)
      .set({
        title: input.title,
        description: input.description,
        eventDate: input.eventDate,
        externalUrl: input.externalUrl,
        imageUrl: input.imageUrl,
        locationDetail: input.locationDetail,
        region: input.region,
        metadata: input.metadata,
        updatedAt: now,
      })
      .where(eq(posts.id, existing[0].id));
    return "updated";
  }

  await db.insert(posts).values({
    type: "event",
    status: "active",
    source: input.source,
    title: input.title,
    description: input.description,
    eventDate: input.eventDate,
    externalUrl: input.externalUrl,
    imageUrl: input.imageUrl,
    locationDetail: input.locationDetail,
    region: input.region,
    externalId: input.externalId,
    metadata: input.metadata,
    authorId: null,
  });
  return "inserted";
}

export async function listRecentForFeed(options: {
  limit?: number;
}): Promise<{ events: PostWithAuthor[]; directory: PostWithAuthor[] }> {
  const limit = Math.min(options.limit ?? 6, 20);
  const half = Math.ceil(limit / 2);

  const eventRows = await db
    .select({
      post: posts,
      displayName: users.displayName,
      username: users.username,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.type, "event"), eq(posts.status, "active")))
    .orderBy(desc(posts.createdAt))
    .limit(half);

  const dirRows = await db
    .select({
      post: posts,
      displayName: users.displayName,
      username: users.username,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(
      and(eq(posts.type, "directory_entry"), eq(posts.status, "active"))
    )
    .orderBy(desc(posts.createdAt))
    .limit(half);

  const mapRow = (r: (typeof eventRows)[number]): PostWithAuthor => ({
    post: r.post,
    authorDisplay: authorLabel(r.displayName, r.username),
  });

  return {
    events: eventRows.map(mapRow),
    directory: dirRows.map(mapRow),
  };
}
