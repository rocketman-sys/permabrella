/**
 * Seed Community Q&A with real app schema:
 * - thread authored by Siddh with question text
 * - first reply authored by PermAi with answer text
 *
 * Usage:
 *   npm run db:seed:community-qna
 *   npm run db:seed:community-qna -- --dry-run
 *   npm run db:seed:community-qna -- --file=data/import/permabrella_qna_seed.json
 */

import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../src/lib/db";
import { messages, threads, topics, users } from "../../src/lib/db/schema";

type SeedRecord = {
  slug: string;
  category_slug: string;
  title: string;
  excerpt: string;
  question_markdown: string;
  answer_markdown: string;
  author_name: string;
  status: string;
  sort_order: number;
  seed_key: string;
  created_at: string;
  updated_at: string;
};

const categoryToTopicSlug: Record<string, string> = {
  "soil-composting": "soil-composting",
  "seeds-propagation": "seeds-propagation",
  "market-gardens-growing": "market-gardens",
  "land-access-sharing": "land-access",
  "food-preservation": "food-preservation",
  "regen-ag-permaculture": "regen-ag-permaculture",
  "water-irrigation": "water-irrigation",
  "general-discussion": "general",
};

function loadEnvLocal(): void {
  const envFile = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envFile)) return;

  const raw = fs.readFileSync(envFile, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function resolveSeedPath(): string {
  const pathArg = process.argv.find((a) => a.startsWith("--file="));
  const relativePath =
    pathArg?.slice("--file=".length) ?? "data/import/permabrella_qna_seed.json";
  return path.resolve(process.cwd(), relativePath);
}

async function ensureUser(input: {
  email: string;
  username: string;
  displayName: string;
}): Promise<string> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);
  if (existing[0]) return existing[0].id;

  const passwordHash = await bcrypt.hash(
    `seed-only-${input.username}-${Date.now()}`,
    12
  );
  const [created] = await db
    .insert(users)
    .values({
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      passwordHash,
      role: "member",
    })
    .returning({ id: users.id });

  return created.id;
}

async function main() {
  loadEnvLocal();
  const dryRun = process.argv.includes("--dry-run");

  const seedPath = resolveSeedPath();
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found: ${seedPath}`);
  }
  const raw = fs.readFileSync(seedPath, "utf8");
  const records = JSON.parse(raw) as SeedRecord[];
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("Seed JSON is empty or invalid.");
  }

  const siddhId = await ensureUser({
    email: process.env.QNA_SEED_SIDDH_EMAIL ?? "siddh@permabrella.seed",
    username: "siddh",
    displayName: "Siddh",
  });
  const permAiId = await ensureUser({
    email: process.env.QNA_SEED_PERMAI_EMAIL ?? "permai@permabrella.seed",
    username: "permai",
    displayName: "PermAi",
  });

  const neededTopicSlugs = [
    ...new Set(
      records.map((r) => {
        const mapped = categoryToTopicSlug[r.category_slug];
        if (!mapped) {
          throw new Error(`No topic mapping for category slug: ${r.category_slug}`);
        }
        return mapped;
      })
    ),
  ];

  const topicRows = await db
    .select({ id: topics.id, slug: topics.slug })
    .from(topics)
    .where(inArray(topics.slug, neededTopicSlugs));
  const topicIdBySlug = new Map(topicRows.map((t) => [t.slug, t.id]));
  const missingSlugs = neededTopicSlugs.filter((slug) => !topicIdBySlug.has(slug));
  if (missingSlugs.length) {
    throw new Error(`Missing topics in database: ${missingSlugs.join(", ")}`);
  }

  let insertedThreads = 0;
  let insertedReplies = 0;
  let skippedThreads = 0;
  let skippedReplies = 0;

  for (const record of records) {
    const topicSlug = categoryToTopicSlug[record.category_slug];
    const topicId = topicIdBySlug.get(topicSlug)!;
    const question = record.question_markdown.trim();
    const answer = record.answer_markdown.trim();

    const existingThread = await db
      .select({ id: threads.id })
      .from(threads)
      .where(and(eq(threads.topicId, topicId), eq(threads.title, record.title)))
      .limit(1);

    let threadId: string;
    if (existingThread[0]) {
      threadId = existingThread[0].id;
      skippedThreads++;
    } else if (dryRun) {
      console.log(`[dry-run] create thread: ${record.title}`);
      continue;
    } else {
      const [createdThread] = await db
        .insert(threads)
        .values({
          topicId,
          authorId: siddhId,
          title: record.title,
          body: question,
          tags: [record.category_slug, "seeded-qna"],
        })
        .returning({ id: threads.id });

      threadId = createdThread.id;
      insertedThreads++;
      await db
        .update(topics)
        .set({ threadCount: sql`${topics.threadCount} + 1` })
        .where(eq(topics.id, topicId));
    }

    const existingAnswer = await db
      .select({ id: messages.id })
      .from(messages)
      .where(
        and(
          eq(messages.threadId, threadId),
          eq(messages.authorId, permAiId),
          eq(messages.body, answer)
        )
      )
      .limit(1);
    if (existingAnswer[0]) {
      skippedReplies++;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] create reply for: ${record.title}`);
      continue;
    }

    await db.insert(messages).values({
      threadId,
      authorId: permAiId,
      body: answer,
    });
    insertedReplies++;
    await db
      .update(threads)
      .set({
        replyCount: sql`${threads.replyCount} + 1`,
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(threads.id, threadId));
  }

  if (dryRun) {
    console.log("[dry-run] completed.");
  } else {
    console.log(
      `Done. Inserted threads=${insertedThreads}, inserted replies=${insertedReplies}, skipped threads=${skippedThreads}, skipped replies=${skippedReplies}.`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
