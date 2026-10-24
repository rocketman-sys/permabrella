# Network stage one

Public pages: `/equipment`, `/join`, `/contact`, `/about`. The homepage, footer,
mobile menu and How it works link to the new network pathways. Equipment,
formal membership, coordinator support and the dedicated workshop programme are
explicitly coming soon. Registering interest creates neither an account nor a
membership, equipment reservation or permission to operate equipment.

## Private enquiries

Anonymous visitors can submit membership interest or a team enquiry. Server-side
validation requires consent, a name and email; membership also requires a council
area, and contact requires a message. Optional interests come from a fixed list.
Only `admin` accounts can read `/admin/enquiries` or mark an enquiry reviewed.
The permission check runs in the page and every action, against the current
database role; the broader admin layout's moderator access does not grant access.

Submissions are stored in `network_enquiries`, separate from posts, profiles,
public search and AI retrieval. No submission content is logged. Hourly HMAC keys
limit submissions by both platform-provided IP and email to five per hour, in one
atomic query. IP addresses are not stored. Identical submissions within the same
hour are acknowledged without creating another record. Expired rate-limit keys
are removed on subsequent requests. Honeypot submissions are not stored.

An administrator should check new enquiries regularly, respond using the supplied
email, and mark them reviewed. A request to remove details should be verified with
the submitter and handled by an authorised administrator; this release does not
automatically delete enquiries. Do not forward enquiry details to other groups
without the submitter's agreement.

Optional `NETWORK_ENQUIRY_EMAIL` sends a generic new-enquiry alert through the
existing Resend setup. The email contains only the private inbox link, not visitor
details. Missing configuration or a failed alert does not discard the submission.
There are no automatic emails to visitor-supplied addresses. Configure only an
approved team recipient; they need a site administrator account to open the link.

## Schema and release

For installations initially provisioned with `db:push`, run
`npx tsx scripts/apply-network-enquiry-schema.ts` to inspect, then use `--apply`.
The script applies only the three additive statements in migration 0008 in one
transaction. It does not alter existing users or listings. Normal migration-based
installations can use the checked-in Drizzle migration and journal instead.

Validation: `npm run lint`, `npm run build`, and
`node --env-file=.env.local --import tsx --test src/lib/network/enquiries.test.ts`.
Database tests use temporary tables in transactions and never insert real records.
Browser test enquiries use `stage-one-check@example.test` and must be removed
after checking persistence.

Before activating a coordinator's access, confirm the account with the site owner.
Do not infer administrator authority from a username or a listing contact address.
Partner copy is based on the successful application and the owner's founding
partner instructions. No award amount, launch date or completed incorporation is
asserted. LLS workshop collaboration remains explicitly prospective.

## Status and mobile review — 24 October 2026

The owner confirmed that `permabrella@gmail.com` is live and PermaBrella is now
listed on Google. These are owner-reported updates; Google listing details and
mail delivery were not independently tested in this review. Network enquiry
notifications were already configured for this address.

The owner has emailed Tommy and requested that further feature development wait
for his feedback. The mobile review was authorised to continue. No application
code, public content, account permissions or production data was changed during
that review. The owner subsequently authorised the three mobile improvements
below and their deployment; broader network features still await Tommy's feedback.

Reviewed the production site in browser viewports of 320, 390 and 768 CSS pixels,
including a short 320 × 568 screen. The viewport measurements were verified in
the rendered browser; this resolves the earlier failed viewport-override check.
This was responsive browser testing, not testing on physical iOS/Android devices.

Coverage: homepage; Equipment, Membership interest, Contact and About; Events,
Exchange, Land Connect, Groups, Grants and Discuss; News, How it works and Search.
No horizontal page overflow was observed on the reviewed narrow layouts. The
groups directory was checked again after its listings finished loading.

Confirmed:

- The mobile menu opens, follows links and closes after navigation or Escape.
  It scrolls internally on a short screen, making its last link reachable.
- Homepage membership and event buttons fit the phone layout; the activity
  counters and equipment status remain present. The tablet homepage fits too.
- Membership and contact fields use 16 px text. Name/email inputs are 44 px high;
  membership interest checkboxes have larger clickable label rows. The tablet
  membership form fits its two-column layout.
- Empty submissions focus the first required field; no valid enquiry was
  submitted and no notification email was generated during this review.
- Directory search for “Roots” returns relevant groups. Homepage search for
  “compost” reaches four discussion results without horizontal overflow.
- Exchange and News have explanatory empty states. The Exchange calls to action
  are visible and fit the phone layout. No captured browser console errors were
  returned at the time of inspection.

Findings from the review:

1. Bring “Explore the community” higher on the homepage. Its heading is about
   6,612 px down at 390 px width, and 7,635 px down at 320 px width. Long listing
   previews and verification notes make the route to those six links lengthy.
   Keep short status summaries on cards and the full context on detail pages.
2. Consider pagination or a “Load more” control in Groups. All 86 groups render
   together, producing a roughly 46,430 px page at 320 px width. Search works,
   but unfiltered browsing is cumbersome on a phone.
3. Adjust validation scrolling in membership/contact forms so the field label
   remains visible below the sticky header. The input itself is reachable, but
   its label can be obscured when the browser jumps to the first required field.

The grant names the Curly’s Ag Hand-E T electric tractor, with flail mower,
slasher, power harrow and auger. Product reference found during this review:
https://curlysag.com.au/products/hand-e-t-trade-electric-tractor-skid-steer-loader-farm-hand-australian-made
Use Tommy’s supplier quotation to confirm the actual package; the public product
and collection pages show differing descriptions/prices, so no price or final
specification was added to the site.

## Mobile improvements — authorised follow-up

- Moved the six Explore the community cards directly after the homepage hero,
  search and activity counters. At 390 px width the heading moves from about
  6,612 px to 1,514 px down the page. Featured partner cards and the live feeds
  remain present below these navigation links.
- Groups now queries 12 records per page, with Previous/Next controls above and
  below the list, an accurate total/range, and a page indicator. Search and region
  are retained in pagination URLs. A new search resets to the first page.
  Invalid page values use page one; pages beyond the end show the final page.
  Empty searches retain their existing helpful state. The count and list share
  filtering conditions, and a unique ID tie-breaker makes ordering deterministic.
  Roots & Rivers remains first in the unfiltered directory.
- Added scroll margins to membership/contact fields, supplementing the existing
  document scroll padding so native validation leaves labels below the sticky
  header. Native validation, consent and submission handling are unchanged.

Checks: production build including TypeScript, lint, four existing search tests,
and read-only directory checks across all eight pages (86 distinct groups, no
omissions or duplicates). Checked filter totals, invalid/end pages and no results.
Browser checks covered 320, 390, 768 and 1280 px layouts, pagination anchors and
Back navigation, combined search/region persistence, search reset, and required
form fields including message and consent. Name/message labels remained below the
93 px header after validation. No horizontal overflow or captured browser errors
were observed. No valid test enquiry was submitted and no email was sent.
These checks use browser viewports, not physical iOS/Android devices.
