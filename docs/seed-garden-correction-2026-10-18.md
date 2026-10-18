# Separate SEED and Mullumbimby Community Garden

Reviewed 18 October 2026 against the organisations' own websites. These are separate directory entries even though both publish 156 Stuart Street, Mullumbimby as their address.

| Listing | Public website | Published phone | Published email |
| --- | --- | --- | --- |
| Seed Northern Rivers | https://seednorthernrivers.org.au/ | 0422 819 610 | admin@mullumseed.org.au |
| Mullumbimby Community Garden | https://mullumbimbycommunitygarden.org/ | 0498 833 850 | mullumcommunitygarden@gmail.com |

SEED's home and [contact page](https://seednorthernrivers.org.au/contact) support its regional services and contacts. The garden's [about page](https://mullumbimbycommunitygarden.org/about) supports its gardening activities; its [contact page](https://mullumbimbycommunitygarden.org/contact) supplies the separate phone and email. The old phone and `info@` address are replaced, not copied across. Acreage, awards, seed-shed ownership and the unverified mid-2025 rebrand date are omitted. No relationship between the organisations is asserted in either description.

SEED's [legacy history page](https://mullumseed.org.au/about) explicitly records the garden becoming a separate entity in 2018. That page also publishes `admin@seednorthernrivers.org.au`; this correction uses `admin@mullumseed.org.au`, the email visibly published on SEED's current homepage. Contacts were checked against public pages; no emails or calls were sent to test delivery.

## Identity and import behaviour

- Preserve `d7442de8-38a9-488d-bd83-6e0d1de2c5e7` for Seed Northern Rivers: the combined record already led with SEED's name and linked to its website. Existing bookmarks keep working.
- Create `eacec348-1c69-4b00-ac2c-41fe77ef7e5e` for Mullumbimby Community Garden. The pre-change database scan found no separate garden listing.
- Replace the combined CSV row with two independently sourced rows. The standard importer skips their exact titles after correction; it does not merge by address or website. The separate Northern Rivers Food Coalition entry sharing SEED's website remains untouched.
- Run this correction before using the revised CSV on an existing database containing the old combined record. Fresh databases can import the revised CSV normally.

## Apply and recover

Use the existing PermaBrella database configuration. The script uses `DATABASE_URL` or `.env.local`, without printing credentials. Review the default dry run before adding `--apply`:

```sh
node --import tsx scripts/separate-seed-community-garden.ts
node --import tsx scripts/separate-seed-community-garden.ts --apply --backup-dir=/path/to/private-backups
```

Only the original listing's public content fields, metadata and update timestamp change. Its identity, source, creation timestamp, author and moderation attribution remain intact. One garden record is added without an invented author. The script refuses ambiguous identities, an existing garden, or changes since the reviewed original timestamp; both writes run in one serializable transaction. A second run verifies the reviewed fields and makes no changes.

The mode-0600 backup records the original public fields before the transaction and both resulting records after it. It contains no database credentials or user account data. Keep it outside Git. Rollback previews by default:

```sh
node --import tsx scripts/separate-seed-community-garden.ts --rollback=/path/to/backup.json
# Add --apply to execute the reviewed rollback.
```

Rollback refuses to overwrite subsequent edits. It restores the original SEED content and marks the new garden record `removed`, preserving it for recovery; nothing is permanently deleted. Review import CSV changes before any future import after rollback.

The directory and detail routes read the database at request time. Verify both detail URLs, the unfiltered directory, the Mullumbimby filter, and their telephone, email and website links after applying.

The shared source-check notice now shows its funding-round caveat only for grants. Adding verification dates to these group records exposed that previously unconditional sentence; the group source-check date remains visible without an irrelevant funding warning.
