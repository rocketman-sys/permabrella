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
