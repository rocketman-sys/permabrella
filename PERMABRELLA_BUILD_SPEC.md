# PermaBrella — Build Specification & Cursor Instructions

## Project Overview

**PermaBrella** is a community food security switchboard for the Northern Rivers region of NSW, Australia. It aggregates local food-growing activity, connects growers with land, and hosts a searchable community Q&A knowledge base. It serves as an umbrella portal for existing local groups and a coordination dashboard for the food security network.

**Domain:** https://permabrella.org

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | Auth.js (NextAuth v5) with credentials provider |
| Email | Resend (transactional email for notifications) |
| Hosting | Vercel |
| Repo | GitHub |

### Why these choices
- **Drizzle ORM** — type-safe, lightweight, works natively with Neon's serverless driver. No heavy migration tooling.
- **Auth.js v5** — built for Next.js App Router, handles sessions, JWT, and credential-based auth cleanly.
- **Resend** — built for Vercel/Next.js, simple API, generous free tier (100 emails/day free, 3000/month).

---

## Project Structure

```
permabrella/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout — nav, footer, providers
│   │   ├── page.tsx                   # Homepage — merged feed/timeline
│   │   ├── globals.css                # Tailwind imports + custom styles
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── page.tsx               # Events & Workshops listing
│   │   │   ├── [id]/page.tsx          # Single event detail
│   │   │   └── new/page.tsx           # Submit an event form
│   │   │
│   │   ├── offerings/
│   │   │   ├── page.tsx               # Offerings & Wants listing
│   │   │   ├── [id]/page.tsx          # Single listing detail
│   │   │   └── new/page.tsx           # Post an offering/want
│   │   │
│   │   ├── land-connect/
│   │   │   ├── page.tsx               # Land ↔ Farmer matchmaking
│   │   │   ├── [id]/page.tsx          # Single land listing
│   │   │   └── new/page.tsx           # Post a land listing
│   │   │
│   │   ├── directory/
│   │   │   ├── page.tsx               # Community Groups directory
│   │   │   └── [id]/page.tsx          # Group detail page
│   │   │
│   │   ├── community/
│   │   │   ├── page.tsx               # Q&A topics overview
│   │   │   ├── [topicSlug]/
│   │   │   │   ├── page.tsx           # Thread listing for a topic
│   │   │   │   └── [threadId]/page.tsx # Thread detail + replies
│   │   │   └── new/page.tsx           # Start a new thread
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx               # Admin dashboard
│   │   │   ├── moderation/page.tsx    # Moderation queue
│   │   │   └── bridge/page.tsx        # Facebook bridge tool for volunteers
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── posts/route.ts         # CRUD for switchboard posts
│   │       ├── threads/route.ts       # CRUD for Q&A threads
│   │       ├── messages/route.ts      # CRUD for thread replies
│   │       ├── notifications/route.ts # Email notification triggers
│   │       └── cron/
│   │           ├── eventbrite/route.ts # Scheduled Eventbrite pull
│   │           └── humanitix/route.ts  # Scheduled Humanitix pull
│   │
│   ├── components/
│   │   ├── ui/                        # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── SearchBar.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── RegionFilter.tsx       # Global region selector
│   │   │
│   │   ├── posts/
│   │   │   ├── PostCard.tsx           # Universal card component
│   │   │   ├── PostForm.tsx           # Shared submission form
│   │   │   ├── PostList.tsx           # Filterable list of cards
│   │   │   └── PostDetail.tsx
│   │   │
│   │   ├── community/
│   │   │   ├── TopicCard.tsx
│   │   │   ├── ThreadCard.tsx
│   │   │   ├── ThreadView.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   └── NewThreadForm.tsx
│   │   │
│   │   └── feed/
│   │       └── FeedTimeline.tsx       # Merged activity feed for homepage
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Neon client + Drizzle instance
│   │   │   ├── schema.ts             # All Drizzle table definitions
│   │   │   └── migrations/           # Drizzle migration files
│   │   │
│   │   ├── auth.ts                   # Auth.js config
│   │   ├── email.ts                  # Resend client + email templates
│   │   ├── regions.ts                # Region constants and helpers
│   │   └── utils.ts                  # Shared utilities
│   │
│   └── types/
│       └── index.ts                  # Shared TypeScript types
│
├── public/
│   ├── images/
│   └── icons/
│
├── drizzle.config.ts                 # Drizzle Kit config for migrations
├── .env.local                        # Local env vars (DO NOT COMMIT)
├── .env.example                      # Template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Database Schema (Drizzle ORM)

Create this in `src/lib/db/schema.ts`:

```typescript
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
} from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================

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
]);

export const postStatusEnum = pgEnum("post_status", [
  "active",
  "pending_moderation",
  "expired",
  "removed",
]);

export const postSourceEnum = pgEnum("post_source", [
  "direct",           // User posted via the portal
  "eventbrite",       // Auto-pulled from Eventbrite
  "humanitix",        // Auto-pulled from Humanitix
  "rss",              // Auto-pulled from RSS feed
  "facebook_bridge",  // Volunteer-bridged from Facebook
  "google_calendar",  // Auto-pulled from Google Calendar
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

// ============================================
// USERS
// ============================================

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

// ============================================
// POSTS (universal card model)
// Events, Offerings, Wants, Land Listings, Directory Entries
// ============================================

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: postTypeEnum("type").notNull(),
  status: postStatusEnum("status").default("active").notNull(),
  source: postSourceEnum("source").default("direct").notNull(),

  // Content
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  contactMethod: text("contact_method"),        // email, phone, link — whatever poster prefers
  externalUrl: text("external_url"),             // link back to source (Eventbrite, FB post, etc.)
  imageUrl: text("image_url"),

  // Location & time
  region: regionEnum("region"),
  locationDetail: text("location_detail"),        // free text address or landmark
  eventDate: timestamp("event_date"),             // for events — when it happens
  expiresAt: timestamp("expires_at"),             // auto-expire for offerings/wants (30 days default)

  // Metadata
  externalId: varchar("external_id", { length: 255 }), // Eventbrite ID, etc. for dedup
  tags: jsonb("tags").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),

  // Relations
  authorId: uuid("author_id").references(() => users.id),
  moderatedById: uuid("moderated_by_id").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// COMMUNITY Q&A
// ============================================

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),          // emoji or icon name
  sortOrder: integer("sort_order").default(0).notNull(),
  threadCount: integer("thread_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const threads = pgTable("threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  topicId: uuid("topic_id").references(() => topics.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),

  title: varchar("title", { length: 300 }).notNull(),
  body: text("body").notNull(),
  region: regionEnum("region"),
  tags: jsonb("tags").$type<string[]>().default([]),

  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").references(() => threads.id).notNull(),
  authorId: uuid("author_id").references(() => users.id).notNull(),
  parentId: uuid("parent_id"),                    // self-reference for nested replies

  body: text("body").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// SUBSCRIPTIONS (for email notifications)
// ============================================

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  threadId: uuid("thread_id").references(() => threads.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// AUTOMATED SOURCES (config for API feeds)
// ============================================

export const automatedSources = pgTable("automated_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),  // "eventbrite", "humanitix", "rss", "google_calendar"
  config: jsonb("config").$type<Record<string, unknown>>().notNull(), // API keys, URLs, org IDs, etc.
  isActive: boolean("is_active").default(true).notNull(),
  lastFetchedAt: timestamp("last_fetched_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## Environment Variables

Create `.env.example` with:

```bash
# Database (Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.ap-southeast-2.aws.neon.tech/permabrella?sslmode=require

# Auth.js — production; use http://localhost:3000 for local dev
NEXTAUTH_URL=https://permabrella.org
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXT_PUBLIC_SITE_URL=https://permabrella.org

# Resend (transactional email)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@permabrella.org

# Eventbrite API (Phase 2)
# EVENTBRITE_API_KEY=

# Humanitix API (Phase 2)
# HUMANITIX_API_KEY=
```

---

## Initial Data: Seed Topics

Create a seed file at `src/lib/db/seed.ts`:

```typescript
import { db } from "./index";
import { topics } from "./schema";

const initialTopics = [
  {
    name: "Soil & Composting",
    slug: "soil-composting",
    description: "Soil health, composting methods, biochar, worm farms, and soil biology",
    icon: "🌱",
    sortOrder: 1,
  },
  {
    name: "Seeds & Propagation",
    slug: "seeds-propagation",
    description: "Seed saving, swaps, germination, nursery techniques, and plant propagation",
    icon: "🌾",
    sortOrder: 2,
  },
  {
    name: "Market Gardens & Growing",
    slug: "market-gardens",
    description: "Market gardening, crop planning, pest management, and growing techniques",
    icon: "🥬",
    sortOrder: 3,
  },
  {
    name: "Land Access & Sharing",
    slug: "land-access",
    description: "Finding land, land sharing arrangements, leases, and access agreements",
    icon: "🏞️",
    sortOrder: 4,
  },
  {
    name: "Food Preservation",
    slug: "food-preservation",
    description: "Fermenting, drying, canning, root cellaring, and storage techniques",
    icon: "🫙",
    sortOrder: 5,
  },
  {
    name: "Regen Ag & Permaculture",
    slug: "regen-ag-permaculture",
    description: "Regenerative agriculture, permaculture design, agroforestry, and holistic management",
    icon: "🔄",
    sortOrder: 6,
  },
  {
    name: "Water & Irrigation",
    slug: "water-irrigation",
    description: "Water harvesting, irrigation systems, swales, dams, and water management",
    icon: "💧",
    sortOrder: 7,
  },
  {
    name: "General Discussion",
    slug: "general",
    description: "Anything food security related that doesn't fit elsewhere",
    icon: "💬",
    sortOrder: 99,
  },
];

async function seed() {
  console.log("Seeding topics...");
  await db.insert(topics).values(initialTopics).onConflictDoNothing();
  console.log("Done.");
}

seed().catch(console.error);
```

---

## Phase 1 Implementation Steps (for Cursor)

Follow these steps in order. Each step should be a working commit.

### Step 1: Project initialisation

```bash
npx create-next-app@latest permabrella --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd permabrella
```

### Step 2: Install dependencies

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
npm install next-auth@beta @auth/drizzle-adapter
npm install resend
npm install bcryptjs
npm install -D @types/bcryptjs
```

### Step 3: Configure Drizzle

Create `drizzle.config.ts` in project root:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Create `src/lib/db/index.ts`:

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Step 4: Create the schema

Copy the full schema from the Database Schema section above into `src/lib/db/schema.ts`.

### Step 5: Run initial migration

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

### Step 6: Set up Auth.js

Create `src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user.length) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user[0].passwordHash
        );

        if (!isValid) return null;

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].displayName || user[0].username,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
```

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### Step 7: Create registration API route

Create `src/app/api/auth/register/route.ts`:

```typescript
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await db
      .insert(users)
      .values({ email, username, passwordHash })
      .returning({ id: users.id, email: users.email, username: users.username });

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Email or username already taken" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Step 8: Build the root layout with navigation

Create the root layout at `src/app/layout.tsx` with:
- Responsive navbar with links: Home, Events, Offerings, Land Connect, Directory, Community
- "Post to Switchboard" CTA button (links to a general submission page)
- Login/Register buttons (or user menu when logged in)
- Footer with about text, links, and region selector
- Use Tailwind — earthy, warm colour palette: greens, browns, cream/off-white backgrounds
- Mobile-first responsive design

### Step 9: Build the homepage

`src/app/page.tsx` should show:
- Hero section: "PermaBrella — Northern Rivers Food Security Switchboard" with a one-liner about connecting growers, land, and knowledge
- Quick-access panel grid (cards linking to Events, Offerings, Land Connect, Directory, Community)
- Recent activity feed (placeholder for now, will pull from all content types later)
- Region filter bar

### Step 10: Set up Resend for email

Create `src/lib/email.ts`:

```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotificationEmail({
  to,
  threadTitle,
  replyAuthor,
  replyPreview,
  threadUrl,
}: {
  to: string;
  threadTitle: string;
  replyAuthor: string;
  replyPreview: string;
  threadUrl: string;
}) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `New reply in: ${threadTitle}`,
    html: `
      <p><strong>${replyAuthor}</strong> replied to <strong>${threadTitle}</strong>:</p>
      <blockquote>${replyPreview}</blockquote>
      <p><a href="${threadUrl}">View the full thread</a></p>
      <p style="color: #666; font-size: 12px;">
        You're receiving this because you're subscribed to this thread on PermaBrella.
      </p>
    `,
  });
}
```

---

## Regions Constant

Create `src/lib/regions.ts`:

```typescript
export const REGIONS = [
  { value: "lismore", label: "Lismore" },
  { value: "byron_bay", label: "Byron Bay" },
  { value: "mullumbimby", label: "Mullumbimby" },
  { value: "nimbin", label: "Nimbin" },
  { value: "bangalow", label: "Bangalow" },
  { value: "kyogle", label: "Kyogle" },
  { value: "casino", label: "Casino" },
  { value: "tweed", label: "Tweed" },
  { value: "ballina", label: "Ballina" },
  { value: "murwillumbah", label: "Murwillumbah" },
  { value: "dunoon", label: "Dunoon" },
  { value: "clunes", label: "Clunes" },
  { value: "federal", label: "Federal" },
  { value: "the_channon", label: "The Channon" },
  { value: "uki", label: "Uki" },
  { value: "other", label: "Other" },
] as const;

export type Region = (typeof REGIONS)[number]["value"];
```

---

## Design Guidelines

### Colour Palette
- **Primary green:** `#2D5016` (deep forest) — headers, primary buttons
- **Secondary green:** `#5A8F3C` (leaf green) — accents, links
- **Warm earth:** `#8B6914` (ochre) — secondary actions, highlights
- **Background:** `#FAFAF5` (warm off-white)
- **Card background:** `#FFFFFF`
- **Text primary:** `#1A1A1A`
- **Text secondary:** `#6B7280`
- **Border:** `#E5E2D9` (warm grey)

### Typography
- Headings: system font stack or Inter — clean, readable, not corporate
- Body: same stack, 16px base

### Tone
- Practical, warm, community-oriented
- No corporate speak, no startup jargon
- This is a community tool built by the community

---

## Vercel Cron Jobs (Phase 2 — for reference)

In `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/eventbrite",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/humanitix",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

These run every 6 hours to pull new events from external platforms.

---

## Build Sequence Summary

| Phase | What | Outcome |
|-------|------|---------|
| 1 | Foundation — project, DB, auth, layout, homepage | Live skeleton at Vercel URL |
| 2 | Directory + Events panel (with API feeds) | First useful content, shareable |
| 3 | Community Q&A + email notifications | Sticky engagement loop |
| 4 | Offerings & Wants | Classifieds panel live |
| 5 | Land Connect (with moderation) | High-value matchmaking |
| 6 | Facebook Bridge + Feed view + search polish | Full switchboard operational |
| 7 | Automation expansion (RSS, Google Cal, etc.) | Ongoing |

---

## Notes for Cursor

- Use App Router (not Pages Router) for everything
- Server Components by default; add `"use client"` only when needed (forms, interactive elements)
- Use Server Actions for form submissions where appropriate
- All database queries should go through Drizzle — no raw SQL unless necessary
- Keep API routes thin — business logic in separate service files if it grows
- Validate all user input server-side (never trust the client)
- Use `revalidatePath()` or `revalidateTag()` after mutations to keep UI in sync
- Mobile-first responsive design throughout — many users will access on phones
