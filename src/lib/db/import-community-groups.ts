/**
 * Bulk-import directory listings from data/import/community_groups.csv
 *
 * Usage:
 *   npm run db:import:community-groups
 *   npm run db:import:community-groups -- --dry-run
 *
 * Requires DATABASE_URL (e.g. from .env.local — loaded automatically if present).
 * Optional: IMPORT_AUTHOR_USERNAME=username — set author_id when you want listings
 * attributed to an existing user (otherwise author_id is null).
 */

import { parse } from "csv-parse/sync";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { and, eq } from "drizzle-orm";
import { parseRegionParam } from "../regions";
import { db } from "./index";
import { posts, users } from "./schema";

const DEFAULT_CSV = "data/import/community_groups.csv";

function loadEnvLocal(): void {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
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

function parseTags(raw: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

async function resolveAuthorId(): Promise<string | null> {
  const username = process.env.IMPORT_AUTHOR_USERNAME?.trim();
  if (!username) return null;
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!rows[0]) {
    console.warn(
      `IMPORT_AUTHOR_USERNAME=${username} — no user found; using null author_id.`
    );
    return null;
  }
  return rows[0].id;
}

async function main(): Promise<void> {
  loadEnvLocal();

  const dryRun = process.argv.includes("--dry-run");
  const csvPathArg = process.argv.find((a) => a.startsWith("--file="));
  const csvPath = csvPathArg
    ? csvPathArg.slice("--file=".length)
    : resolve(process.cwd(), DEFAULT_CSV);

  if (!existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const body = readFileSync(csvPath, "utf8");
  const rows = parse(body, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  if (!rows.length) {
    console.error("No data rows in CSV.");
    process.exit(1);
  }

  const authorId = await resolveAuthorId();
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = (row.name ?? "").trim();
    const description = (row.description ?? "").trim();
    if (!title || !description) {
      console.warn("Skipping row with missing name or description:", row);
      skipped++;
      continue;
    }

    const dup = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(eq(posts.type, "directory_entry"), eq(posts.title, title))
      )
      .limit(1);
    if (dup.length) {
      console.log(`Skip (exists): ${title}`);
      skipped++;
      continue;
    }

    const regionRaw = (row.region ?? "").trim();
    const region = regionRaw ? parseRegionParam(regionRaw) : undefined;
    if (regionRaw && !region) {
      console.error(`Invalid region "${regionRaw}" for row: ${title}`);
      process.exit(1);
    }

    const tags = parseTags(row.tags ?? "");
    const metadata: Record<string, unknown> = {
      importBatch: "community_groups_csv",
      importFile: csvPath.replace(process.cwd() + "/", ""),
    };
    const source = (row.source ?? "").trim();
    if (source) metadata.source = source;

    const phone = (row.phone ?? "").trim() || null;
    const email = (row.email ?? "").trim() || null;
    const website = (row.website ?? "").trim() || null;
    const logoUrl = (row.logo_url ?? "").trim() || null;
    const locationDetail = (row.location_detail ?? "").trim() || null;

    const values = {
      type: "directory_entry" as const,
      status: "active" as const,
      source: "direct" as const,
      title: title.slice(0, 300),
      description,
      contactPhone: phone,
      contactEmail: email,
      contactMethod: null,
      externalUrl: website,
      imageUrl: logoUrl,
      region: region ?? null,
      locationDetail,
      tags,
      metadata,
      authorId,
    };

    if (dryRun) {
      console.log(`[dry-run] would insert: ${title}`);
      inserted++;
      continue;
    }

    await db.insert(posts).values(values);
    console.log(`Inserted: ${title}`);
    inserted++;
  }

  console.log(
    dryRun
      ? `[dry-run] ${inserted} row(s) would be inserted, ${skipped} skipped.`
      : `Done. ${inserted} inserted, ${skipped} skipped.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
