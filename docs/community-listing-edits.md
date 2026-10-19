# Community listing edits

Signed-in members may edit public content on active or expired Groups, Grants and Land Connect listings. Food resources stored in Groups use the same workflow. Removed or pending listings, other post types, deletion, moderation, ownership, accounts and roles are outside this feature.

Every Server Action calls the existing authenticated session check. The database mutation rechecks the actor's session version, eligible post type/status and exact ID-bound update timestamp. Administrator restoration also rechecks the current role and that the revision belongs to the target listing. An atomic statement updates the listing, consumes an hourly allowance (60 saves per account), and inserts the revision. A conflict leaves the submitted form text intact.

Only explicitly allowed fields enter forms and history. Names come from the server's account record and never fall back to email. HTML, unsafe URLs, oversized fields, unknown keys, duplicate form fields and invalid dates are rejected. Plain text is rendered with React escaping. Contact fields are public; the form explains public attribution and history before submission. Existing verification dates remain historical; any community edit is marked unverified, and edited grants lose deadline-confirmed highlighting. History contains only public content; user email, password, sessions, account settings and arbitrary metadata are excluded.

## Deployment

Apply migration `0006_community_listing_edits` before deploying the new code. For the existing db:push-provisioned installation, run `scripts/apply-listing-edit-schema.ts` in dry-run mode, then with `--apply`. It adds two tables and foreign keys; existing records and permission roles are unchanged. Do not run historical migrations blindly over a db:push installation.

The additive schema is compatible with the previous deployment. To disable the feature, roll back the app deployment and retain the new tables/history. Do not drop populated revision tables. Administrators can restore either side of a revision from the listing's public history; restoration adds another revision and keeps all history.

## Verification

`node --import tsx --test src/lib/listing-edits/*.test.ts` runs validation and database-boundary tests. Database tests require DATABASE_URL and create only transaction-local temporary fixture tables (ON COMMIT DROP); unqualified mutation queries resolve to those temporary tables. They do not edit live posts or accounts. Browser tests use temporary local fixture pages and a signed-in read-only production form check; do not create fake public listings.
