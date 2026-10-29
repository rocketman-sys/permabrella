# Source-checked grant updates

The baseline snapshot is `grant-survey-2026-10-19.json`. It preserves 25 existing listing IDs and adds two verified programs. The additive supplement `grant-survey-2026-10-30.json` adds five more opportunities without rewriting those 27 records. Closed rounds remain recoverable in the Past & closed view. Funding directories are separate from grants; `conservation-support.json` holds the NSW support pathways and official sources.

Use the existing project database environment. Do not commit credentials or backups.

```sh
node --import tsx scripts/refresh-grants-survey.ts --file=data/grant-survey-2026-10-30.json
node --import tsx scripts/refresh-grants-survey.ts --file=data/grant-survey-2026-10-30.json --apply
```

The first command is a dry run. Writes are atomic and reject intervening edits. The script logs a prepared public-field backup before writing, then a separate applied manifest with timestamps for guarded rollback. Keep both copies somewhere durable. Rerunning the same snapshot makes no changes.

```sh
node --import tsx scripts/refresh-grants-survey.ts --restore=/path/to/backup.applied.json
node --import tsx scripts/refresh-grants-survey.ts --restore=/path/to/backup.applied.json --apply
```

Rollback refuses rows changed since the update. New records are marked removed, not deleted; existing public fields are restored. A prepared-only backup requires manual inspection of database state before recovery.

To review an older or future snapshot, pass `--file=data/grant-survey-YYYY-MM-DD.json`. Historical CSV imports skip existing titles but do not refresh grant facts; use the latest source-checked snapshot for maintenance. The refresh expects its existing IDs to be present and will stop rather than silently recreate missing records.

The verification date records the latest successful source check. A failed source attempt must preserve `lastVerifiedAt`; `lastCheckedAt` and verification notes record the attempt. Clarence Sustainable Agriculture retains 17 October verification because its source was unavailable on 19 October. Some funder pages have conflicting old text; per-entry notes record the evidence used.

The 30 October supplement uses official indexed text where direct council pages block access. It records that limitation and does not import unverified dates or funding caps. Lismore's exact next-round dates and applicant stream remain unconfirmed; Rous announces a 1 June 2027 opening. `Upcoming - check opening` keeps these discoverable with an amber notice, excludes them from closing soon, and never automatically claims applications have opened. Review the provider before changing that status. The two new conservation support cards carry their own check dates; older cards retain their original date.

NSW deadlines use Australia/Sydney. Date-only cutoffs have no claimed closing hour; the following midnight is a visibility boundary. An explicit `end_of_day` value is used only when the application portal confirms it. Rolling programs have no invented deadline. The Together on Country final EOI window is April 2027 or exhaustion of funds, without a published exact day.
