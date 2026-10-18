/**
 * Scoped public directory correction, dry-run by default.
 * node --import tsx scripts/separate-seed-community-garden.ts [--apply] [--backup-dir=PATH]
 * node --import tsx scripts/separate-seed-community-garden.ts --rollback=BACKUP [--apply]
 * DATABASE_URL must target the reviewed PermaBrella database. Never prints credentials.
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { parse } from "csv-parse/sync";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";

loadEnvConfig(process.cwd());
const SEED_ID = "d7442de8-38a9-488d-bd83-6e0d1de2c5e7";
const GARDEN_ID = "eacec348-1c69-4b00-ac2c-41fe77ef7e5e";
const OLD_TITLE = "Seed Northern Rivers (Mullumbimby Community Garden)";
const CORRECTION = "separate-seed-community-garden-2026-10-18";
const CSV = "data/import/community_groups.csv";
type Fields = {
  title: string; description: string; contact_phone: string | null;
  contact_email: string | null; external_url: string | null;
  location_detail: string | null; region: string | null;
  tags: string[]; metadata: Record<string, unknown>;
};
type Row = Fields & { id: string; type: string; status: string; updated_at: string };
type Backup = { correction: string; before: Row; after: Row[] };

function reviewedFields(title: string, metadata: Record<string, unknown> = {}): Fields {
  const rows = parse(readFileSync(CSV, "utf8"), { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
  const matches = rows.filter((row) => row.name === title);
  if (matches.length !== 1 || rows.some((row) => row.name === OLD_TITLE)) throw Error("CSV identities need review.");
  const r = matches[0];
  if (r.region !== "mullumbimby" || !r.source.includes("verified 2026-10-18")) throw Error("CSV provenance needs review.");
  return {
    title, description: r.description, contact_phone: r.phone || null,
    contact_email: r.email || null, external_url: r.website || null,
    location_detail: r.location_detail || null, region: r.region,
    tags: r.tags.split(",").map((tag) => tag.trim()),
    metadata: { ...metadata, importFile: CSV, importBatch: metadata.importBatch ?? "community_groups:community_groups",
      source: r.source, correctionId: CORRECTION, lastVerifiedAt: "2026-10-18" },
  };
}

async function main() {
  if (!process.env.DATABASE_URL) throw Error("DATABASE_URL is required.");
  const db = neon(process.env.DATABASE_URL);
  const apply = process.argv.includes("--apply");
  const rollback = process.argv.find((arg) => arg.startsWith("--rollback="))?.slice(11);
  const backupDir = resolve(process.argv.find((arg) => arg.startsWith("--backup-dir="))?.slice(13) ?? tmpdir());
  const readRows = () => db`select id, type, status, title, description, contact_phone, contact_email,
      external_url, location_detail, region, tags, metadata, updated_at::text as updated_at
    from posts where id = any(${[SEED_ID, GARDEN_ID]}::uuid[])
      or (type='directory_entry' and (title ~* '(mullum.*(seed|community.?garden)|seed.*(northern.?rivers|mullum))'
        or external_url ~* '(^https?://)?(www[.])?mullumbimbycommunitygarden[.]org'))`;
  const rows = await readRows() as Row[];
  if (rows.some((r) => ![SEED_ID, GARDEN_ID].includes(r.id))) throw Error("Another matching listing exists; review before changing anything.");
  const seed = rows.find((r) => r.id === SEED_ID);
  const garden = rows.find((r) => r.id === GARDEN_ID);
  if (!seed || rows.some((r) => r.type !== "directory_entry")) throw Error("Listing identity mismatch.");

  const update = (before: Row, after: Fields, status: string, updatedAt: string) => db`with changed as (
    update posts set title=${after.title}, description=${after.description}, contact_phone=${after.contact_phone},
      contact_email=${after.contact_email}, external_url=${after.external_url}, location_detail=${after.location_detail},
      region=${after.region}::region, tags=${JSON.stringify(after.tags)}::jsonb, metadata=${JSON.stringify(after.metadata)}::jsonb,
      status=${status}::post_status, updated_at=${updatedAt}::timestamp
    where id=${before.id}::uuid and type='directory_entry' and title=${before.title}
      and status=${before.status}::post_status and updated_at=${before.updated_at}::timestamp returning id
    ) select 1 / count(*)::integer as applied from changed`;
  const now = new Date().toISOString();

  if (rollback) {
    const backup = JSON.parse(readFileSync(rollback, "utf8")) as Backup;
    if (backup.correction !== CORRECTION || backup.before.id !== SEED_ID || backup.after.length !== 2 || !garden ||
        !rows.every((row) => isDeepStrictEqual(row, backup.after.find((saved) => saved.id === row.id)))) {
      throw Error("Rollback backup or current records differ; refusing to overwrite later work.");
    }
    console.log("Rollback: restore original SEED fields and mark the new garden listing removed (recoverable).");
    if (!apply) return;
    await db.transaction([
      update(seed, backup.before, backup.before.status, backup.before.updated_at),
      update(garden, garden, "removed", now),
    ], { isolationLevel: "Serializable" });
    console.log("Rolled back atomically; no rows deleted.");
    return;
  }

  const seedFields = reviewedFields("Seed Northern Rivers", seed.metadata);
  const gardenFields = reviewedFields("Mullumbimby Community Garden");
  const matches = (row: Row | undefined, fields: Fields) => row?.status === "active" &&
    Object.entries(fields).every(([key, value]) => isDeepStrictEqual(row[key as keyof Row], value));
  if (matches(seed, seedFields) && matches(garden, gardenFields)) {
    console.log("Both reviewed listings already match. No changes.");
    return;
  }
  if (seed.title !== OLD_TITLE || seed.status !== "active" || seed.updated_at !== "2026-04-21 23:03:21.077894" || garden) {
    throw Error("Original record changed or garden already exists; review before applying.");
  }
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", update: { id: SEED_ID, ...seedFields }, insert: { id: GARDEN_ID, ...gardenFields } }, null, 2));
  if (!apply) return;
  mkdirSync(backupDir, { recursive: true });
  const backupPath = join(backupDir, `${CORRECTION}-${Date.now()}.json`);
  const backup: Backup = { correction: CORRECTION, before: seed, after: [] };
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), { mode: 0o600, flag: "wx" });
  console.log(`Pre-change public-field backup: ${backupPath}`);
  // The exact timestamp guards later edits. A zero-row update aborts the whole transaction.
  // The fixed new UUID and duplicate-name check prevent repeated application from creating copies.
  const results = await db.transaction([
    update(seed, seedFields, "active", now),
    db`with added as (
      insert into posts (id, type, status, source, title, description, contact_phone, contact_email,
        external_url, location_detail, region, tags, metadata, created_at, updated_at)
      select ${GARDEN_ID}::uuid, 'directory_entry', 'active', 'direct', ${gardenFields.title},
        ${gardenFields.description}, ${gardenFields.contact_phone}, ${gardenFields.contact_email},
        ${gardenFields.external_url}, ${gardenFields.location_detail}, ${gardenFields.region}::region,
        ${JSON.stringify(gardenFields.tags)}::jsonb, ${JSON.stringify(gardenFields.metadata)}::jsonb,
        ${now}::timestamp, ${now}::timestamp
      where not exists (select 1 from posts where type='directory_entry' and
        (title ~* '(mullum.*community.?garden|seed.*northern.?rivers)' and id <> ${SEED_ID}::uuid))
      returning id
    ) select 1 / count(*)::integer as applied from added`,
    readRows(),
  ], { isolationLevel: "Serializable" });
  backup.after = results[2] as Row[];
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), { mode: 0o600 });
  if (backup.after.length !== 2 || !matches(backup.after.find((r) => r.id === SEED_ID), seedFields) ||
      !matches(backup.after.find((r) => r.id === GARDEN_ID), gardenFields)) throw Error("Post-change verification needs review; retain backup.");
  console.log(`Applied and verified atomically. Rollback backup: ${backupPath}`);
  for (const row of backup.after) console.log(`https://www.permabrella.org/directory/${row.id}`);
}

main().catch((error: unknown) => {
  // Database errors can include connection details. Report only local guard messages.
  console.error(error instanceof Error && error.constructor === Error ? error.message : "Database operation failed; retain the backup and check current records before retrying.");
  process.exitCode = 1;
});
