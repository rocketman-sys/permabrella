# Northern Rivers event additions checked 19 October 2026

The checked-in batch contains 16 new single-day events from 20 October–7 November 2026. Sources explicitly support each future occurrence; historical recurrence was not extrapolated. Existing events and directory records are retained. Recurring garden and food-swap activities link to their existing directory entries.

Prices are advertised Australian-dollar prices, not a ticket-availability guarantee. Ballina’s 24 October cleanup has three conflicting published start times: the date is stored for sorting, while public cards/details display “Time to be verified” without an invented midnight. The Channon’s 7 November booking page retains a stale May ticket label; this is visibly flagged. Other optional uncertainty appears in the listing’s verification note.

Grafton uses the existing “Other” region option, with Grafton clearly named in the venue. Agricultural shows were held out of this batch in favour of focused community/ecology activities; no unsupported multi-day availability was introduced.

Run `scripts/refresh-local-events.ts` with the existing DATABASE_URL for a dry run; add `--apply` to publish. The script verifies sources, dates, related organisations and duplicate event-specific URL/title/date combinations (shared organiser homepages are supporting evidence, not event identities), uses stable IDs and records a private backup before one serializable transaction. Re-running is a no-op for unchanged applied entries. Later edits cause a conflict rather than an overwrite.

`--restore=/path/to/applied-backup.json` dry-runs a guarded rollback; add `--apply` to soft-remove only the new event records. Later edits block rollback for review. No records are permanently deleted.

Use `--test-transaction` to exercise the complete insert against a transaction-local copy of the posts table. It is removed on commit and never changes public event rows.
