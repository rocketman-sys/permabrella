import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  integer,
  jsonb,
  uniqueIndex,
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
