# Grants Import README

This file documents how to prepare and import grant listings for the PermaBrella Grants page.

## Files

- Data file: `data/import/grants.csv`
- Importer: `src/lib/db/import-grants.ts`
- Script: `npm run db:import:grants`

## CSV Columns

Required columns (header names must match exactly):

- `title`
- `region`
- `summary`
- `best_for`
- `funding`
- `who_can_apply`
- `status_label`
- `tags`
- `link`
- `notes`
- `source`

## Column Guidance

- `title`: Public title shown in listing cards and detail pages.
- `region`: One of the app's supported region values (examples below). Use `other` when unsure.
- `summary`: Short plain-language summary of the opportunity.
- `best_for`: Semicolon-separated use cases (for readability inside description/metadata).
- `funding`: Human-readable amount or "Check current round details".
- `who_can_apply`: Eligibility line in plain language.
- `status_label`: Import status label token (see allowed values below).
- `tags`: Comma-separated tags. `grant` is auto-added by importer.
- `link`: Canonical external URL for the grant/resource.
- `notes`: Optional additional context.
- `source`: Internal provenance note (for editors/import traceability).

## Allowed `status_label` Values

- `open_now`
- `check_current_round`
- `closed_track_next_round`
- `ongoing_resource`

If a value is unknown, importer falls back to `Check current round`.

## Region Values

Use one of the supported region slugs:

- `lismore`
- `byron_bay`
- `mullumbimby`
- `nimbin`
- `bangalow`
- `kyogle`
- `casino`
- `tweed`
- `ballina`
- `murwillumbah`
- `dunoon`
- `clunes`
- `federal`
- `the_channon`
- `uki`
- `other`

## Import Commands

Dry run (recommended first):

`npm run db:import:grants -- --dry-run`

Import default file:

`npm run db:import:grants`

Import a different CSV:

`npm run db:import:grants -- --file=data/import/my-grants.csv`

## Duplicate Handling

Importer skips duplicates by exact match on:

- `posts.type = "grant"`
- `posts.title = CSV title`

## Notes

- Imported rows are created as active `grant` posts.
- Structured fields like status/funding/best-for are stored in `metadata`.
- The main listing text is assembled into `description` for immediate display compatibility.
