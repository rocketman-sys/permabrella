/** Reviewed content correction. Dry-run by default; backups contain only changed public fields.
 * node --import tsx scripts/refresh-site-listings.ts [--apply]
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseSydneyDateTime } from "../src/lib/posts/dates";

loadEnvConfig(process.cwd());
type Review = { id: string; title: string; url: string; status: string; notes: string; deadlineLocal: string | null; deadlineDate?: string; funding: string; verifiedAt: string };
const labels: Record<string, string> = { open_now: "Open now", closed_track_next_round: "Closed - track next round" };

async function main() {
  const db = neon(process.env.DATABASE_URL!);
  const reviews = JSON.parse(readFileSync("data/grant-review-2026-10-17.json", "utf8")) as Review[];
  const orchardId = "0aa934e5-c376-42f3-9025-dec1e51648d2";
  const rows = await db`select id, title, type, description, external_url, metadata, expires_at, updated_at::text as updated_at
    from posts where id = any(${[...reviews.map((r) => r.id), orchardId]}::uuid[])`;
  const queries = [];
  const changed = [];
  for (const review of reviews) {
    const row = rows.find((r) => r.id === review.id);
    if (!row || row.type !== "grant" || row.title !== review.title) throw new Error("Grant identity mismatch; no updates applied.");
    if (row.metadata.reviewBatch === "2026-10-17") continue;
    const metadata = { ...row.metadata, statusLabel: labels[review.status], funding: review.funding, lastVerifiedAt: review.verifiedAt, deadlineDate: review.deadlineDate ?? null, reviewBatch: "2026-10-17", source: review.url };
    const description = row.description.split("\n\n").filter((p: string) => !/^(Status|Notes|Funding):/i.test(p.trim())).join("\n\n") + `\n\nFunding: ${review.funding}\n\nNotes: ${review.notes}`;
    const deadline = review.deadlineLocal ? parseSydneyDateTime(review.deadlineLocal) : null;
    if (review.deadlineLocal && !deadline) throw new Error("Invalid reviewed deadline");
    changed.push(row);
    queries.push(db`with changed as (
      update posts set description=${description}, external_url=${review.url}, metadata=${JSON.stringify(metadata)}::jsonb,
        expires_at=${deadline?.toISOString() ?? null}::timestamp, updated_at=now()
      where id=${row.id}::uuid and updated_at=${row.updated_at}::timestamp returning id
    ) select 1 / count(*)::integer as applied from changed`);
  }
  const orchard = rows.find((r) => r.id === orchardId);
  if (!orchard || orchard.title !== "Rescue orchard in mid Burringbar") throw new Error("Orchard identity mismatch");
  if (orchard.type === "event") {
    changed.push(orchard);
    // Preserve updated_at: recategorisation does not confirm availability with the author.
    queries.push(db`with changed as (
      update posts set type='land_available', metadata=metadata || '{"previousType":"event"}'::jsonb
      where id=${orchardId}::uuid and type='event' and updated_at=${orchard.updated_at}::timestamp returning id
    ) select 1 / count(*)::integer as applied from changed`);
  } else if (orchard.type !== "land_available" || orchard.metadata.previousType !== "event") throw new Error("Unexpected orchard classification");
  console.log(`${changed.length} reviewed corrections ${process.argv.includes("--apply") ? "ready to apply" : "would be applied"}.`);
  changed.forEach((row) => console.log(row.title));
  if (!process.argv.includes("--apply") || !queries.length) return;
  const backup = join(tmpdir(), `permabrella-public-listing-backup-${Date.now()}.json`);
  writeFileSync(backup, JSON.stringify(changed, null, 2), { mode: 0o600 });
  // All changes roll back if any row was concurrently edited (division by zero).
  await db.transaction(queries);
  console.log(`Applied atomically. Public-field rollback backup: ${backup}`);
}
main().catch(() => { console.error("Listing correction failed; inspect the dry run before retrying."); process.exitCode = 1; });
