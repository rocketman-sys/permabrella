# Reviewed listing updates, 19 October 2026

The user approved this snapshot and visible uncertainty notes. `listing-survey-2026-10-19.json` targets 64 existing directory records and one existing land lead, and adds 16 directory resources plus 12 Land Connect resources/leads. Resilient Byron is retained as a removed record with a canonical Plan C reference; its old public URL redirects to Plan C. No row is deleted. The result is 79 active directory records and 13 Land Connect records, plus the existing YFC directory record cross-listed in Land Connect.

The snapshot preserves existing IDs, authors, creation timestamps, source attribution, images and fields outside the explicit patch. Existing records must match the reviewed title and update timestamp. New IDs are stable; conflicting names or URLs stop the run. Writes use one serializable transaction with per-row timestamp checks. A repeated run verifies the applied content and makes no changes.

Use the existing DATABASE_URL without printing it:

```sh
node --import tsx scripts/refresh-researched-listings.ts
node --import tsx scripts/refresh-researched-listings.ts --apply
node --import tsx scripts/refresh-researched-listings.ts --restore=/private/path/backup.applied.json
# Append --apply only to execute the reviewed restore.
```

The dry run is the default. Apply writes a mode-0600 prepared backup before the transaction, followed by a separate applied manifest with resulting timestamps. Preserve both outside Git. Restore checks timestamps and batch metadata, refuses intervening edits, restores original public fields and marks additions removed rather than deleting them.

This production correction expects the existing reviewed IDs; it is not a fresh-database bootstrap. Historical community-group CSV files now contain the corrected fields and verification metadata, and omit the duplicate Resilient Byron row. The importer also checks retained aliases/previous names. The additional directory CSV supplies stable IDs and metadata for new resources. Land resources are maintained by the reviewed snapshot. Run the correction before imports on the existing production database; never rerun stale imports to overwrite current facts.

`lastCheckedAt` means an editorial source attempt, not blanket verification. `verificationNote` states specific unresolved details and is visible on cards and detail pages. No contact delivery or private social content was tested. The three historical/unreliable CSA leads in `notAdded` remain unpublished. A Land Connect resource's internal storage type does not represent a land offer: `landConnectCategory` separates resources and work leads in the UI and `listingLabel` explains their actual status. Dates in descriptions are explicitly historical/advertised. Dated job starts and CSA season ends change visible status as they pass without inventing application deadlines.
