# Mullumbimby directory additions — 20 October 2026

The live directory audit found 80 records (79 active and one recoverably removed). None of the seven suggested groups had a separate record or matching title/alias. Six additions use fixed IDs, an explicit source list and visible verification notes. No existing listing is edited.

| Listing | Evidence and limits |
| --- | --- |
| Mullum Organic Food Co-op | Its [home page](https://www.mullumfoodcoop.com/) identifies the member-run shop inside the community garden. The [contact page](https://www.mullumfoodcoop.com/contact) shows different Thursday hours; no hours are copied. This is separate from the Rural Co-op. |
| The Elder Tree Educational Medicine Garden | The [organiser's garden page](https://www.theeldertree.org/garden) describes the herb garden, classes, working bees and public email. It is undated and still names Reforest Now among neighbouring projects, so it does not verify a recent nursery transition. No treatment, registration or charity-status claims are included. |
| Mullumbimby Men's Shed | The [Australian Men's Shed Association directory](https://mensshed.org/sheds/mullumbimby-mens-shed-inc/) describes practical activities and publishes the Stuart Street address and phone. The linked shed website was inaccessible during review; contact, opening and participation arrangements are flagged for confirmation. No legal-status claim is included. |
| Generous Earth Co-operative | Provisional community-reported nursery initiative. The description attributes its intended seedling/cutting activity to the report; current location, name and arrangements remain unverified. Website and contacts remain blank. No nursery handover, registration, named participants or private anecdotes are published. |
| Mullum Library of Stuff | Its [about page](https://libraryofstuff.org.au/about/) describes the lending collection and member participation and places it in the blue brick shed beside the Community Hall on River Terrace. It is not placed at the community garden. Current opening and membership arrangements should be checked. |
| Shedding Community Workshop (The Railway Shed) | Its [official Linktree](https://linktr.ee/sheddingcommunityworkshop) links current workshop categories and its own site. The [workshops](https://www.shedding.com.au/workshops/) and [contact](https://www.shedding.com.au/contact-us/) pages identify the Railway Shed, 18 Prince Street, and public email. Different published phone numbers were found, so the phone field is blank. Shedding remains separate from the Men's Shed. |
| Byron Bees | Held pending exact identity or official profile confirmation. No social handle or listing is attached to an unrelated similarly named campaign, product or organisation. |

Existing Mullumbimby Community Garden (`eacec348-1c69-4b00-ac2c-41fe77ef7e5e`), SEED Northern Rivers (`d7442de8-38a9-488d-bd83-6e0d1de2c5e7`) and Mullumbimby & District Neighbourhood Centre (`e10b0540-34a0-438c-beba-344577423623`) are distinct related records and remain unchanged.

## Applying or restoring this batch

The guarded refresh script accepts `--file=data/directory-additions-2026-10-20.json`; omitting `--file` retains its original October 19 manifest. It is a dry run unless `--apply` is supplied. Supply the existing approved database environment without copying credentials into source control.

```sh
node --import tsx scripts/refresh-researched-listings.ts --file=data/directory-additions-2026-10-20.json
node --import tsx scripts/refresh-researched-listings.ts --file=data/directory-additions-2026-10-20.json --apply
```

The script checks IDs, existing titles/websites and field validity, saves a mode-0600 backup before writing, and applies the batch in a serializable transaction. The applied backup supports `--restore=BACKUP` (dry run) and `--restore=BACKUP --apply`. New records are marked removed on restore, never deleted. Restore refuses to overwrite subsequent edits.

`data/import/community_groups_mullum_2026_10_20.csv` retains the same IDs, descriptions, sources, aliases and verification notes for future imports. The existing importer skips records by title/alias; the fixed IDs provide an additional duplicate safeguard. Neither path changes site presentation or AI configuration.

## Live verification

The six additions were applied together on 20 October 2026. A before/after comparison found all 80 existing records unchanged; the directory now contains 86 records, including 85 active records. Each new detail page returned HTTP 200, displayed its verification note, and appeared in directory search. The Generous Earth notice was also checked in the browser. A repeat dry run reported `0 updates; 0 additions`.

The JSON manifest and retained CSV agree on all six IDs, descriptions and metadata. ESLint, TypeScript and whitespace checks passed. The applied rollback backup and before/after public-field snapshots are retained privately outside Git. Byron Bees remains unpublished pending an exact identity or official profile link.
