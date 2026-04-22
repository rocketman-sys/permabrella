# PermaBrella — Community Groups Seed Data

Starter list of **31 Northern Rivers community groups** relevant to permaculture, food security, regenerative agriculture, and community resilience. Curated for the PermaBrella portal database. Scope: food + regen + resilience across all 7 Northern Rivers LGAs. Compiled 2026-04-22, revised to match the portal `posts (type: directory_entry)` schema after Cursor schema review.

## Files

- **`community_groups.csv`** — first batch: UTF-8, comma-delimited, double-quoted fields, one header row, 31 data rows.
- **`community_groups_batch2.csv`** — second batch: same columns as batch 1; **must include the same header row** as batch 1 (name, region, …). 28 additional groups (Clarence Valley, Casino, Ballina coast, Byron food relief, Landcare, etc.).

## Schema (mapped to PermaBrella `posts` table)

| CSV column | Maps to | Type | Notes |
|---|---|---|---|
| `name` | `title` | string, required | Display name |
| `region` | `region` | enum slug | Must be one of the app's region slugs (see list below). Use `other` when no slug fits. |
| `location_detail` | `location_detail` | string | Freeform suburb / address / "serves Northern Rivers". Shown on detail page; not filterable. |
| `tags` | `tags[]` | string array | Comma-separated within the CSV field. Controlled vocabulary (see list below). |
| `phone` | `contact_phone` | string, nullable | Stored as its own column; shown on the listing with a `tel:` link. |
| `email` | `contact_email` | string, nullable | Stored as its own column; shown with a `mailto:` link. |
| *(optional)* | `contact_method` | text, nullable | Use for “other contact notes” only (not required for this CSV). |
| `website` | `external_url` | string (URL), nullable | One URL per row, full `https://`. |
| `logo_url` | `image_url` | string (URL), nullable | Left empty across all rows — no stable logo URLs verified. Populate during QA. |
| `description` | `description` | text, required | 1-3 sentence blurb suitable for a listing card. |
| `source` | `metadata.source` | string, nullable | Provenance note for moderation / correction. Not public. |

## Region slug vocabulary (enum)

`lismore`, `byron_bay`, `mullumbimby`, `nimbin`, `bangalow`, `kyogle`, `casino`, `tweed`, `ballina`, `murwillumbah`, `dunoon`, `clunes`, `federal`, `the_channon`, `uki`, `other`

Rows that didn't cleanly fit (Brunswick Heads, Minyon, Yamba, "regional") are set to `other` with the specific location preserved in `location_detail`.

## Tag vocabulary

Used in this dataset:

`permaculture`, `education`, `demonstration-site`, `community-garden`, `seed-saving`, `food-co-op`, `food-systems`, `food-security`, `food-relief`, `localisation`, `resilience`, `disaster-recovery`, `neighbourhood-centre`, `philanthropy`, `landcare`, `farmers-market`

Each row has 1-3 tags, comma-separated inside the quoted CSV field. If the portal stores tags as a Postgres `text[]`, parse as: `string_to_array(tags, ',')`.

## Data confidence

- **High confidence** (verified website + at least one verified contact): Permaculture College Australia, Byron Centre for Permaculture, Seed Northern Rivers, Nimbin Organic Food Co-op, Nimbin Neighbourhood Centre, Northern Rivers Community Foundation, Northern Rivers Community Gateway, Resilient Lismore, Brunswick Valley Landcare, The Good Pantry, Zaytuna Farm.
- **Medium confidence** (verified website, contact inferred from standard `info@domain` / `admin@domain` patterns): Byron Seed Savers, Resilient Byron, Resilient Uki, Minyon Resilience Network, Relocalise NR, Plan C, Northern Rivers Food, farmers markets, Richmond Landcare, Tweed Landcare, Kyogle Landcare, North Coast Regional Landcare Network.
- **Lower confidence / gaps**: Wilsons River Landcare (Facebook only, no direct contacts), Lower Clarence Community Gardens (contacts unverified), Murwillumbah Community Garden (email is a published `@gmail.com` — verify).

The `source` column flags where email/phone was inferred vs. verified so a human can triage during QA.

## Known gaps to fill in later rounds

- Clarence Valley LGA under-represented (only Yamba).
- Richmond Valley LGA (Casino / Evans Head / Coraki) has no dedicated entries. Casino Food Co-op is a commercial processor, not a community group, so excluded.
- First Nations-led groups: intentionally light in this first pass — warrants dedicated outreach rather than web-scraping. NRCF's First Nation Food Security Project is a likely entry point.
- Repair cafés, tool libraries, bulk-buy co-ops: excluded per scope. Flag for scope expansion.
- Transition Towns chapters: no active chapters surfaced. Check locally whether Mullum Cares / Transition Bangalow are still running.

## Running the import (repo script)

From the project root, with `DATABASE_URL` set (or present in `.env.local`):

```bash
npm run db:import:community-groups
```

Preview without writing:

```bash
npm run db:import:community-groups -- --dry-run
```

Optional: attribute rows to an existing user by username:

```bash
IMPORT_AUTHOR_USERNAME=siddh npm run db:import:community-groups
```

By default **`author_id` is null** (allowed by the schema). Rows that already exist as `directory_entry` with the same **`title`** are skipped.

Import batch 2 (or any other file with the same columns):

```bash
npm run db:import:community-groups -- --file=data/import/community_groups_batch2.csv
npm run db:import:community-groups -- --dry-run --file=data/import/community_groups_batch2.csv
```

Each run records `metadata.importBatch` as `community_groups:<filename_without_ext>` so you can tell batches apart in the database.

## Import notes for Cursor

Given the portal's existing `posts` schema, pseudocode for the import step:

```js
// For each CSV row:
const post = {
  type: 'directory_entry',
  title: row.name,
  region: row.region,                      // enum slug
  location_detail: row.location_detail,
  tags: row.tags ? row.tags.split(',').map((t) => t.trim()) : [],
  contact_phone: row.phone?.trim() || null,
  contact_email: row.email?.trim() || null,
  contact_method: null,                    // optional free-text notes
  external_url: row.website || null,
  image_url: row.logo_url || null,
  description: row.description,
  metadata: { source: row.source },
};
```

The app now has dedicated `contact_phone` and `contact_email` columns on `posts`; this CSV maps to them directly.

## Suggested next steps

1. **Schema sanity check** — confirm `region` slug enum matches current app values (list above was Cursor-provided; verify against the actual migration).
2. **Verification pass** — quick email/phone verification for the ~15 rows marked "inferred" in the `source` column.
3. **Logo URLs** — populate `logo_url` either from each org's website favicon/logo or by hosting small optimised copies locally.
4. **Tag consolidation** — decide whether some tags should collapse (e.g. `food-systems` + `food-security` vs. keep distinct).
5. **Second-round scraping** — fill Clarence Valley, Richmond Valley, and First Nations gaps.
