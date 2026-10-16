/** Apply the source-checked public grant survey. Dry-run unless --apply is supplied.
 * node --import tsx scripts/refresh-grants-survey.ts [--apply]
 * Existing IDs are preserved. Changes are atomic, backed up and safe to rerun.
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
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
};

async function main() {
  const survey = JSON.parse(readFileSync("data/grant-survey-2026-10-17.json", "utf8")) as {
    surveyDate: string; batch: string; entries: Entry[];
  };
  const client = neon(process.env.DATABASE_URL!);
  const rows = await client`select id, type, title, status, description, external_url, region,
    expires_at::text, metadata, updated_at::text from posts where type='grant'`;
  const queries = [];
  const backup = [];
  let inserted = 0;
  let updated = 0;
  const ids = new Set<string>();
  for (const entry of survey.entries) {
    if (ids.has(entry.id) || !/^[\da-f-]{36}$/.test(entry.id)) throw new Error("Invalid or duplicate grant ID");
    ids.add(entry.id);
    if (!entry.title || !entry.summary || !entry.notes || !entry.funding || !entry.whoCanApply ||
      !parseRegionParam(entry.region) || entry.eligibleRegions.some((r) => !parseRegionParam(r)) ||
      !["Open now", "Rolling applications", "Closed - track next round", "Ongoing resource", "Check current round"].includes(entry.statusLabel) ||
      [entry.url, ...entry.sourceUrls].some((url) => new URL(url).protocol !== "https:")) throw new Error("Invalid survey entry");
    const deadline = entry.deadlineLocal ? parseSydneyDateTime(entry.deadlineLocal) : null;
    if (entry.deadlineLocal && !deadline) throw new Error("Invalid NSW deadline");
    if (entry.deadlineDate && !/^\d{4}-\d{2}-\d{2}$/.test(entry.deadlineDate)) throw new Error("Invalid closing date");
    const row = rows.find((r) => r.id === entry.id);
    if ((entry.existing && !row) || (row && (row.title !== entry.title || row.status !== "active"))) throw new Error("Grant identity or moderation status changed");
    if (!row && rows.some((r) => r.title === entry.title || r.external_url === entry.url)) throw new Error("Possible duplicate grant; review before applying");
    const hash = createHash("sha256").update(JSON.stringify(entry)).digest("hex");
    if (row?.metadata.grantSurveyHash === hash) continue;
    const metadata = {
      ...(row?.metadata ?? {}), statusLabel: entry.statusLabel, funding: entry.funding,
      whoCanApply: entry.whoCanApply, eligibilitySummary: entry.eligibilitySummary ?? entry.whoCanApply,
      eligibleRegions: entry.eligibleRegions, source: entry.url, sourceUrls: entry.sourceUrls,
      lastVerifiedAt: survey.surveyDate, deadlineDate: entry.deadlineDate, deadlineTime: entry.deadlineTime,
      deadlineConfirmed: Boolean(deadline && entry.statusLabel === "Open now"),
      grantSurveyBatch: survey.batch, grantSurveyHash: hash,
    };
    const description = `${entry.summary}\n\nFunding: ${entry.funding}\n\nWho can apply: ${entry.whoCanApply}\n\nNotes: ${entry.notes}`;
    // Timestamp columns hold UTC wall-clock values; the application reads them as UTC.
    const expiresAt = deadline?.toISOString() ?? null;
    if (row) {
      backup.push(row);
      updated++;
      queries.push(client`with changed as (
        update posts set description=${description}, external_url=${entry.url},
          expires_at=${expiresAt}::timestamp, metadata=${JSON.stringify(metadata)}::jsonb, updated_at=now()
        where id=${entry.id}::uuid and updated_at=${row.updated_at}::timestamp returning id
      ) select 1 / count(*)::integer as applied from changed`);
    } else {
      backup.push({ id: entry.id, inserted: true, grantSurveyHash: hash });
      inserted++;
      queries.push(client`with changed as (
        insert into posts (id,type,status,source,title,description,external_url,region,expires_at,tags,metadata)
        values (${entry.id}::uuid,'grant','active','direct',${entry.title},${description},${entry.url},
          ${entry.region}::region,${expiresAt}::timestamp,'["grant"]'::jsonb,${JSON.stringify(metadata)}::jsonb)
        on conflict (id) do nothing returning id
      ) select 1 / count(*)::integer as applied from changed`);
    }
    console.log(`${row ? "Update" : "Add"}: ${entry.title} | ${entry.statusLabel} | ${entry.deadlineDate ?? entry.deadlineLocal ?? "No fixed deadline"}`);
  }
  console.log(`${updated} updates and ${inserted} additions ${process.argv.includes("--apply") ? "ready to apply" : "in dry run"}.`);
  if (!process.argv.includes("--apply") || !queries.length) return;
  const backupPath = join(tmpdir(), `permabrella-grant-survey-backup-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(backup, null, 2), { mode: 0o600 });
  await client.transaction(queries);
  console.log(`Applied atomically. Public-field rollback backup: ${backupPath}`);
}

main().catch(() => {
  console.error("Grant survey failed. No partial transaction is committed; check the survey and dry run before retrying.");
  process.exitCode = 1;
});
