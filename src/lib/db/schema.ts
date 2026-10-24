import {
  pgTable,
  primaryKey,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "member",
  "moderator",
  "admin",
]);

export const postTypeEnum = pgEnum("post_type", [
  "event",
  "offering",
  "wanted",
  "land_available",
  "land_wanted",
  "directory_entry",
  "grant",
  "news",
]);

export const postStatusEnum = pgEnum("post_status", [
  "active",
  "pending_moderation",
  "expired",
  "removed",
]);

export const postSourceEnum = pgEnum("post_source", [
  "direct",
  "eventbrite",
  "humanitix",
  "rss",
  "facebook_bridge",
  "google_calendar",
]);

export const regionEnum = pgEnum("region", [
  "lismore",
  "byron_bay",
  "mullumbimby",
  "nimbin",
  "bangalow",
  "kyogle",
  "casino",
  "tweed",
  "ballina",
  "murwillumbah",
  "dunoon",
  "clunes",
  "federal",
  "the_channon",
  "uki",
  "other",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  sessionVersion: integer("session_version").default(0).notNull(),
  displayName: varchar("display_name", { length: 150 }),
  region: regionEnum("region"),
  role: userRoleEnum("role").default("member").notNull(),
  bio: text("bio"),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: postTypeEnum("type").notNull(),
  status: postStatusEnum("status").default("active").notNull(),
  source: postSourceEnum("source").default("direct").notNull(),

  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  contactMethod: text("contact_method"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  externalUrl: text("external_url"),
  imageUrl: text("image_url"),

  region: regionEnum("region"),
  locationDetail: text("location_detail"),
  eventDate: timestamp("event_date"),
  expiresAt: timestamp("expires_at"),

  externalId: varchar("external_id", { length: 255 }),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),

  authorId: uuid("author_id").references(() => users.id),
  moderatedById: uuid("moderated_by_id").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  threadCount: integer("thread_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const threads = pgTable("threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id")
    .references(() => topics.id)
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),

  title: varchar("title", { length: 300 }).notNull(),
  body: text("body").notNull(),
  region: regionEnum("region"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),

  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .references(() => threads.id)
    .notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => messages.id),

  body: text("body").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    threadId: uuid("thread_id")
      .references(() => threads.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("subscriptions_user_thread_uidx").on(t.userId, t.threadId),
  ]
);

export const automatedSources = pgTable("automated_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastFetchedAt: timestamp("last_fetched_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).primaryKey(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResetLimits = pgTable("password_reset_limits", {
  key: varchar("key", { length: 64 }).primaryKey(),
  attempts: integer("attempts").default(1).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

/** Public-field snapshots only; account data and moderation fields never enter history. */
export const listingRevisions = pgTable('listing_revisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  editorId: uuid('editor_id').references(() => users.id).notNull(),
  editorName: varchar('editor_name', { length: 150 }).notNull(),
  kind: varchar('kind', { length: 20 }).notNull(),
  summary: varchar('summary', { length: 500 }).notNull(),
  before: jsonb('before').$type<import('../listing-edits/policy').ListingContent>().notNull(),
  after: jsonb('after').$type<import('../listing-edits/policy').ListingContent>().notNull(),
  restoredFromId: uuid('restored_from_id').references((): AnyPgColumn => listingRevisions.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index('listing_revisions_post_created_idx').on(t.postId,t.createdAt)]);

export const listingEditLimits = pgTable('listing_edit_limits', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  attempts: integer('attempts').notNull(),
});

/** Voluntary member choices; never a visit log and never exposed as a voter list. */
export const threadAcknowledgements = pgTable('thread_acknowledgements', {
  targetId: uuid('target_id').references(() => threads.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  active: boolean('active').default(true).notNull(),
}, t => [primaryKey({columns:[t.targetId,t.userId]})]);
export const messageAcknowledgements = pgTable('message_acknowledgements', {
  targetId: uuid('target_id').references(() => messages.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  active: boolean('active').default(true).notNull(),
}, t => [primaryKey({columns:[t.targetId,t.userId]})]);

/** Private enquiries: never included in public listings, search or member profiles. */
export const networkEnquiries = pgTable("network_enquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: varchar("kind", { length: 20 }).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  area: varchar("area", { length: 80 }).notNull(),
  interests: jsonb("interests").$type<string[]>().notNull(),
  message: text("message").notNull(),
  submissionKey: varchar("submission_key", { length: 64 }).notNull().unique(),
  status: varchar("status", { length: 20 }).default("new").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, t => [index("network_enquiries_status_created_idx").on(t.status, t.createdAt)]);

export const networkEnquiryLimits = pgTable("network_enquiry_limits", {
  key: varchar("key", { length: 64 }).primaryKey(),
  attempts: integer("attempts").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
