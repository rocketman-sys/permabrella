# Grant filters and event calendars

Released November 2026. This change does not alter the equipment or membership rollout.

## Grant browsing

`/grants` accepts `region`, `applicant` and `funding` query parameters. A normal GET form works without client JavaScript and keeps selections in shareable URLs. Previous `?view=past` links remain supported. Invalid/repeated query values fall back safely. The closing-soon section and main results use the same applicant/status filters; directory resources and conservation support are separate from grant results.

Applicant categories in `data/grant-applicants.json` were assigned conservatively from the public eligibility summaries already held on the site. This is not a new provider verification. To classify a new grant, review the complete eligibility requirements, then add its ID, exact current `whoCanApply` text, public source and applicable categories. Do not infer eligibility simply because a keyword appears (for example, “individuals are ineligible”). Restricted or unclear applicant types belong in Eligibility to confirm. If a community edit changes the eligibility summary, the saved classification stops applying until it is reviewed again.

Funding status follows the existing stored status label and live expiry rules. Expired deadlines override “Open now”; an upcoming round does not automatically become open when its expected date arrives. A date alone is not evidence that applications are open. Grant queries retain the existing maximum of 100 records per current/past view; review pagination if the directory approaches that size.

## Event calendars

Current public events with a valid start time offer Google Calendar and a downloadable iCalendar file. The GET route `/events/[id]/calendar` reads the public event record and never creates a booking, calendar subscription or invitation. Invalid/private/non-event IDs return 404; undated, time-unconfirmed or past events return 409.

Times use absolute UTC instants for both calendar formats, including NSW daylight saving. The optional `metadata.eventEnd` must contain a timezone and be later than the start. When the end is absent or invalid, the file omits DTEND and the UI asks the visitor to confirm the duration. No recurrence or end time is invented. Source caveats and booking/listing links travel with the saved entry. Saved entries do not automatically update.

The iCalendar output uses CRLF, escaped text, UTF-8 line folding at 75 octets and a stable event UID. Export responses are not cached, so later downloads use current published details.

## Validation

- `node --import tsx --test src/lib/posts/calendar.test.ts src/lib/posts/grant-filters.test.ts src/lib/posts/freshness.test.ts`
- `node --env-file=.env.local --import tsx --test src/lib/posts/grants.test.ts` (read-only database fixtures)
- ESLint for changed files and the Next.js production build.
- Browser checks at 320 px, 390 px and desktop: combine filters, clear/reset, empty results, open/upcoming/past views, closing-soon consistency, keyboard controls, and calendar download.
- Inspect the actual downloaded file's title, location, UTC start/end, canonical listing and caveats. Check the Google Calendar hand-off without saving an event in the user's calendar.
