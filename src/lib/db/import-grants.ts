/**
 * Bulk-import grants listings from data/import/grants.csv
 *
 * Usage:
 *   npm run db:import:grants
 *   npm run db:import:grants -- --file=data/import/grants.csv
 *   npm run db:import:grants -- --dry-run
 *
 * Requires DATABASE_URL (e.g. from .env.local - loaded automatically if present).
 * Optional: IMPORT_AUTHOR_USERNAME=username - set author_id for imported listings.
 */

import { parse } from "csv-parse/sync";
import { readFileSync, existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { and, eq } from "drizzle-orm";
import { parseRegionParam } from "../regions";
import { db } from "./index";
import { posts, users } from "./schema";

const DEFAULT_CSV = "data/import/grants.csv";

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

function parseCsvTags(raw: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function statusLabelToBadge(statusLabelRaw: string): string {
  const value = statusLabelRaw.trim().toLowerCase();
  if (value === "open_now") return "Open now";
  if (value === "closed_track_next_round") return "Closed - track next round";
  if (value === "ongoing_resource") return "Ongoing resource";
  return "Check current round";
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
      `IMPORT_AUTHOR_USERNAME=${username} - no user found; using null author_id.`
    );
    return null;
  }
  return rows[0].id;
}

function buildDescription(row: Record<string, string>): string {
  const summary = (row.summary ?? "").trim();
  const bestFor = (row.best_for ?? "").trim();
  const funding = (row.funding ?? "").trim();
  const whoCanApply = (row.who_can_apply ?? "").trim();
  const notes = (row.notes ?? "").trim();
  const statusLabel = statusLabelToBadge(row.status_label ?? "");

  const sections = [
    summary,
    bestFor ? `Best for: ${bestFor}` : "",
    funding ? `Funding: ${funding}` : "",
    whoCanApply ? `Who can apply: ${whoCanApply}` : "",
    `Status: ${statusLabel}`,
    notes ? `Notes: ${notes}` : "",
  ].filter(Boolean);

  return sections.join("\n\n");
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
    const title = (row.title ?? "").trim();
    const description = buildDescription(row);
    if (!title || !description) {
      console.warn("Skipping row with missing title or content:", row);
      skipped++;
      continue;
    }

    const dup = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.type, "grant"), eq(posts.title, title)))
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

    const tags = ["grant", ...parseCsvTags(row.tags ?? "")];
    const importFileRel = csvPath.replace(process.cwd() + "/", "");
    const metadata: Record<string, unknown> = {
      importBatch: `grants:${basename(csvPath, ".csv")}`,
      importFile: importFileRel,
      statusLabel: statusLabelToBadge(row.status_label ?? ""),
      bestFor: (row.best_for ?? "").trim() || null,
      funding: (row.funding ?? "").trim() || null,
      whoCanApply: (row.who_can_apply ?? "").trim() || null,
    };
    const source = (row.source ?? "").trim();
    if (source) metadata.source = source;

    const externalUrl = (row.link ?? "").trim() || null;
    const values = {
      type: "grant" as const,
      status: "active" as const,
      source: "direct" as const,
      title: title.slice(0, 300),
      description,
      contactPhone: null,
      contactEmail: null,
      contactMethod: null,
      externalUrl,
      imageUrl: null,
      region: region ?? null,
      locationDetail: null,
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
