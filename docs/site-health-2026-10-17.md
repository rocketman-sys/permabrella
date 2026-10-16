# Site health release — 17 October 2026

The homepage now leads with search and real local listings. Mobile navigation is collapsible. Empty sections explain what belongs there and link to posting and local groups. Homepage news only appears when real news posts exist.

## Listing policy

- Upcoming events remain current through their local calendar day in Australia/Sydney.
- Listings with an elapsed expiry or an explicitly closed grant round move to **Past & closed** automatically at read time. Their detail links remain available.
- Undated opportunities say to confirm dates or availability. Imported grants without a verified deadline say **Check current round**.
- Date-only deadlines remain listed through that NSW calendar day; the interface asks visitors to confirm the closing time. No time is invented for visitors.
- Dates entered in posting forms are interpreted in Northern Rivers time, including daylight saving.
- A source-check date appears only when a source was actually reviewed. Updating a category does not refresh the author’s availability date.

## Reviewed content corrections

`data/grant-review-2026-10-17.json` records seven reviewed grant corrections with provider URLs. Both source CSVs retain the corrections. Kyogle has moved to a new council website: its old URL is a real browser 404 even though the search service returned an older cached page. The new Community Grant round closes 1 November 2026; Event Sponsorship is a separate closed round. Environmental Education closes 9 November 2026 at 11:59 pm NSW time. NRCF now links to its 2026 page. Closed CBP, Restoration, Protecting Our Places and Community Resilience rounds are archived.

The orchard help request moves from Events to Land Connect. Its old event URL redirects permanently to the same listing in Land Connect. Its original availability timestamp is preserved.

Run `node --import tsx scripts/refresh-site-listings.ts` to preview the corrections. Add `--apply` after review. The script checks exact listing identities and concurrent edits, writes a backup of the changed public fields to the system temporary directory, then applies all changes in one transaction. It is idempotent. Apply after deploying the redirect support.

## Password recovery and deployment

Password reset uses hashed, expiring, single-use tokens; per-IP request limits; per-account cooldown; generic account-existence responses; bcrypt byte limits; and session-version invalidation after reset. Admin routes require an authenticated moderator or administrator. Robots and sitemap routes are included.

The existing production database was provisioned without a Drizzle migration ledger. Do not replay the historical migrations against it. `node --import tsx scripts/apply-recovery-schema.ts` previews the additive `0005_password_recovery.sql` migration. Add `--apply` to run it atomically; a second run makes no changes. Fresh databases can use the normal migration sequence. The additive recovery schema was applied and its second run verified during this release.

Production email delivery still requires a valid `RESEND_API_KEY` and `EMAIL_FROM` using a verified sender. Configure them in the existing Vercel project and redeploy. The page clearly reports temporary unavailability while email is unconfigured. A real inbox delivery check is still needed after configuration; no email was sent by the automated tests.

Event imports also need their provider configuration and `CRON_SECRET`; no provider credentials were present during the review. No synthetic events, news or Exchange posts were added.

## Verification

```sh
npm run lint
npx tsc --noEmit
node --import tsx --test src/lib/posts/freshness.test.ts src/lib/auth/reset.test.ts
npm run build
node --import tsx scripts/verify-password-recovery.ts --run
```

The database integration check creates and removes a disposable fixture in one transaction. It verifies single use, expiry, the new password hash and session-version revocation without sending email or modifying an existing account.

Browser checks cover phone widths from 320px, tablet and desktop, menu keyboard dismissal, region-only search, empty-state posting redirects, current/past grant filters, and invalid reset links. The two pre-existing local changes (`package.json` dev command and the untracked Q&A seed CSV) are excluded from this release.
