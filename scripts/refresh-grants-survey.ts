/** Apply the source-checked public grant survey. Dry-run unless --apply is supplied.
 * node --import tsx scripts/refresh-grants-survey.ts [--file=path] [--apply]
 * node --import tsx scripts/refresh-grants-survey.ts --restore=backup-path [--apply]
 * Existing IDs are preserved. Changes are atomic, backed up and safe to rerun.
 */
import { loadEnvConfig } from "@next/env";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseSydneyDateTime } from "../src/lib/posts/dates";
import { parseRegionParam } from "../src/lib/regions";

loadEnvConfig(process.cwd());
type Entry = {
  id: string; existing: boolean; title: string; url: string; region: string;
  summary: string; funding: string; whoCanApply: string; eligibilitySummary?: string;
  notes: string; statusLabel: string; eligibleRegions: string[]; sourceUrls: string[];
  deadlineLocal: string | null; deadlineDate: string | null; deadlineTime: string | null;
  lastVerifiedAt?: string; verificationNote?: string;
  verificationMethod?: string; verificationConfidence?: string;
};
type BackupRow = {
  id: string; inserted?: boolean; description?: string; external_url?: string | null;
  expires_at?: string | null; metadata?: Record<string, unknown>;
  appliedUpdatedAt?: string;
};
type Backup = { batch: string; state: "prepared" | "applied"; rows: BackupRow[] };

/** Restore only this batch, and refuse to overwrite any subsequent edit. */
async function restore(client: NeonQueryFunction<false, false>, path: string) {
  const backup = JSON.parse(readFileSync(path, "utf8")) as Backup;
  if (backup.state !== "applied" || !backup.batch || !Array.isArray(backup.rows) ||
    backup.rows.some((row) => !row.id || !row.appliedUpdatedAt || (!row.inserted && (!row.description || !row.metadata)))) {
    throw new Error("Incomplete rollback backup; inspect the original transaction before restoring");
  }
  const current = await client`select id, updated_at::text, metadata from posts where type='grant'`;
  const queries = backup.rows.map((row) => {
    const match = current.find((item) => item.id === row.id);
    if (!match || match.updated_at !== row.appliedUpdatedAt || match.metadata.grantSurveyBatch !== backup.batch) {
      throw new Error("Grant changed after this batch; rollback requires review");
    }
    // Retain new records recoverably instead of deleting them.
    return row.inserted ? client`with changed as (
      update posts set status='removed', updated_at=now()
      where id=${row.id}::uuid and type='grant' and updated_at=${row.appliedUpdatedAt}::timestamp
        and metadata->>'grantSurveyBatch'=${backup.batch} returning id
    ) select 1 / count(*)::integer as restored from changed` : client`with changed as (
      update posts set description=${row.description!}, external_url=${row.external_url ?? null},
        expires_at=${row.expires_at ?? null}::timestamp, metadata=${JSON.stringify(row.metadata)}::jsonb, updated_at=now()
      where id=${row.id}::uuid and type='grant' and updated_at=${row.appliedUpdatedAt}::timestamp
        and metadata->>'grantSurveyBatch'=${backup.batch} returning id
    ) select 1 / count(*)::integer as restored from changed`;
  });
  console.log(`${queries.length} rollback rows verified${process.argv.includes("--apply") ? "; restoring atomically" : " in dry run"}.`);
  if (process.argv.includes("--apply") && queries.length) await client.transaction(queries);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const client = neon(process.env.DATABASE_URL);
  const restorePath = process.argv.find((arg) => arg.startsWith("--restore="))?.slice(10);
  if (restorePath) return restore(client, restorePath);
  const file = process.argv.find((arg) => arg.startsWith("--file="))?.slice(7) ?? "data/grant-survey-2026-10-19.json";
  const survey = JSON.parse(readFileSync(file, "utf8")) as {
    surveyDate: string; batch: string; entries: Entry[];
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(survey.surveyDate) || !survey.batch) throw new Error("Invalid survey date or batch");
  const rows = await client`select id, type, title, status, description, external_url, region,
    expires_at::text, metadata, updated_at::text from posts where type='grant'`;
  const queries = [];
  const backup: Backup = { batch: survey.batch, state: "prepared", rows: [] };
  let inserted = 0;
  let updated = 0;
  const ids = new Set<string>();
  for (const entry of survey.entries) {
    if (ids.has(entry.id) || !/^[\da-f-]{36}$/.test(entry.id)) throw new Error("Invalid or duplicate grant ID");
    ids.add(entry.id);
    if (!entry.title || !entry.summary || !entry.notes || !entry.funding || !entry.whoCanApply ||
      !parseRegionParam(entry.region) || entry.eligibleRegions.some((r) => !parseRegionParam(r)) ||
      !["Open now", "Rolling applications", "Upcoming - check opening", "Closed - track next round", "Ongoing resource", "Check current round"].includes(entry.statusLabel) ||
      [entry.url, ...entry.sourceUrls].some((url) => new URL(url).protocol !== "https:")) throw new Error("Invalid survey entry");
    const deadline = entry.deadlineLocal ? parseSydneyDateTime(entry.deadlineLocal) : null;
    if (entry.deadlineLocal && !deadline) throw new Error("Invalid NSW deadline");
    if (entry.deadlineDate && !/^\d{4}-\d{2}-\d{2}$/.test(entry.deadlineDate)) throw new Error("Invalid closing date");
    if (entry.lastVerifiedAt && !/^\d{4}-\d{2}-\d{2}$/.test(entry.lastVerifiedAt)) throw new Error("Invalid verification date");
    const row = rows.find((r) => r.id === entry.id);
    if ((entry.existing && !row) || (row && (row.title !== entry.title || row.status !== "active"))) throw new Error("Grant identity or moderation status changed");
    if (!row && rows.some((r) => r.title === entry.title || r.external_url === entry.url)) throw new Error("Possible duplicate grant; review before applying");
    const hash = createHash("sha256").update(JSON.stringify({ checkedDate: survey.surveyDate, entry })).digest("hex");
    if (row?.metadata.grantSurveyHash === hash) continue;
    const metadata = {
      ...(row?.metadata ?? {}), statusLabel: entry.statusLabel, funding: entry.funding,
      whoCanApply: entry.whoCanApply, eligibilitySummary: entry.eligibilitySummary ?? entry.whoCanApply,
      eligibleRegions: entry.eligibleRegions, source: entry.url, sourceUrls: entry.sourceUrls,
      lastVerifiedAt: entry.lastVerifiedAt ?? survey.surveyDate, lastCheckedAt: survey.surveyDate,
      verificationNote: entry.verificationNote ?? null, deadlineDate: entry.deadlineDate, deadlineTime: entry.deadlineTime,
      verificationMethod: entry.verificationMethod ?? null, verificationConfidence: entry.verificationConfidence ?? null,
      deadlineConfirmed: Boolean(deadline && entry.statusLabel === "Open now"),
      grantSurveyBatch: survey.batch, grantSurveyHash: hash,
    };
    const description = `${entry.summary}\n\nFunding: ${entry.funding}\n\nWho can apply: ${entry.whoCanApply}\n\nNotes: ${entry.notes}`;
    // Timestamp columns hold UTC wall-clock values; the application reads them as UTC.
    const expiresAt = deadline?.toISOString() ?? null;
    if (row) {
      backup.rows.push(row as BackupRow);
      updated++;
      queries.push(client`with changed as (
        update posts set description=${description}, external_url=${entry.url},
          expires_at=${expiresAt}::timestamp, metadata=${JSON.stringify(metadata)}::jsonb, updated_at=now()
        where id=${entry.id}::uuid and type='grant' and updated_at=${row.updated_at}::timestamp returning updated_at
      ) select 1 / count(*)::integer as applied, max(updated_at)::text as applied_updated_at from changed`);
    } else {
      backup.rows.push({ id: entry.id, inserted: true });
      inserted++;
      queries.push(client`with changed as (
        insert into posts (id,type,status,source,title,description,external_url,region,expires_at,tags,metadata)
        values (${entry.id}::uuid,'grant','active','direct',${entry.title},${description},${entry.url},
          ${entry.region}::region,${expiresAt}::timestamp,'["grant"]'::jsonb,${JSON.stringify(metadata)}::jsonb)
        on conflict (id) do nothing returning updated_at
      ) select 1 / count(*)::integer as applied, max(updated_at)::text as applied_updated_at from changed`);
    }
    console.log(`${row ? "Update" : "Add"}: ${entry.title} | ${entry.statusLabel} | ${entry.deadlineDate ?? entry.deadlineLocal ?? "No fixed deadline"}`);
  }
  console.log(`${updated} updates and ${inserted} additions ${process.argv.includes("--apply") ? "ready to apply" : "in dry run"}.`);
  if (!process.argv.includes("--apply") || !queries.length) return;
  const backupPath = join(tmpdir(), `permabrella-grant-survey-backup-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), { mode: 0o600, flag: "wx" });
  console.log(`Prepared public-field backup: ${backupPath}`);
  const results = await client.transaction(queries);
  results.forEach((result, index) => { backup.rows[index].appliedUpdatedAt = result[0].applied_updated_at; });
  backup.state = "applied";
  // Keep the pre-transaction copy intact even if recording the outcome fails.
  const appliedPath = backupPath.replace(/\.json$/, ".applied.json");
  writeFileSync(`${appliedPath}.tmp`, JSON.stringify(backup, null, 2), { mode: 0o600, flag: "wx" });
  renameSync(`${appliedPath}.tmp`, appliedPath);
  console.log(`Applied atomically. Public-field rollback backup: ${appliedPath}`);
}

main().catch(() => {
  console.error("Grant survey operation failed. Writes are atomic; inspect the backup and database state before retrying.");
  process.exitCode = 1;
});
