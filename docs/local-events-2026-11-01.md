# Local events survey — 1 November 2026

Seven source-backed additions extend the feed beyond 7 November. Dates below are NSW time. Each record in `data/events-survey-2026-11-01.json` retains the primary source URL, date evidence, check date and any uncertainty. This is a targeted survey, not a complete regional calendar.

| Date | Event | Primary source |
| --- | --- | --- |
| 15 Nov, 9am–3:30pm | Natural Sequence Farming at Banyula Farm, Clunes | [Tarwyn Park Training](https://events.tarwynparktraining.com.au/checkout/view-event/id/9084970/chk/aeb9c296474d1590019b17916b6a6807/?modal_widget=true&widget=true) |
| 18 Nov, 1:30–2:30pm | Nimbin Food Swap | [7 Sibley Street listing](https://nimbinvillage.au/events/food-swap-3rd-wednesday/) |
| 21 Nov, 8am–2pm | Mullumbimby Community Market | [Market operator](https://www.mullumbimbycommunitymarket.com.au/) |
| 21 Nov, 10:30am | Nimbin Skill Share | [7 Sibley Street listing](https://nimbinvillage.au/events/skill-share-workshops-7-sibley-street/) |
| 22 Nov, 2–6pm | Singing Our Future Into Being, Byron Bay | [Organiser's Humanitix page](https://events.humanitix.com/singing-our-future-into-being) |
| 28 Nov, 10:30am–12:30pm | Nimbin Re-love Market | [7 Sibley Street listing](https://nimbinvillage.au/events/flea-market-7-sibley-street/) |
| 5 Dec, 9am–noon | Native Australian Ingredients fermentation workshop | [The Farm](https://www.thefarm.com.au/workshops) |

The live Nimbin pages explicitly showed November dates when checked in the browser. Search-engine copies still showed older occurrences. November skill-share topic, price and end time are unknown; November Re-love theme and visitor price are unknown. Older topics and a stallholder fee are not presented as current admission details. The Skill Share calendar export intentionally omits an end time.

The Farm advertises 5 December and $160, but its booking button points to an unavailable older product page. The listing links to the working venue page, includes the organiser's published contact email, and clearly asks visitors to confirm the session and booking arrangements. It does not claim tickets are available.

Excluded from this batch: already-started courses, old Landcare calendars, closed registrations, locations outside the region, and recurring activities without a verified upcoming date. Existing listings were preserved.

## Import and rollback

Dry run and temporary-table trial:

```sh
node --env-file=.env.local --import tsx scripts/refresh-local-events.ts --file=data/events-survey-2026-11-01.json
node --env-file=.env.local --import tsx scripts/refresh-local-events.ts --file=data/events-survey-2026-11-01.json --test-transaction
```

Publish with `--apply` only after review. The script saves a private temporary backup before its serializable transaction, checks duplicates, and records stable IDs and content hashes. Use the same `--file` with `--restore=/absolute/path/to/applied-backup.json` for a dry-run rollback, then `--apply` to soft-remove only unchanged additions. Edited rows cause a conflict instead of being overwritten.

## Related release checks

- Regional global search includes a grant's eligible regions, while ordinary listings still match their own region; existing publication and expiry rules remain in force.
- Listing details have native Share and Copy link controls using canonical production URLs. Cancel does not copy; denied access offers a selectable URL.
- Exact-match public note copy edits preserve research text, source dates, and unfamiliar/new caveats. The same formatter serves cards, details, calendar exports and helper retrieval.
- Equipment and membership remain unchanged pending Tommy's feedback.
- Build and lint passed; 28 focused checks passed, including real PostgreSQL read-only regional/visibility fixtures.
- Seven additions passed a temporary-table insert trial and were then imported atomically. Local API and calendar checks confirmed all seven, UTC conversion, and no invented Skill Share end time.
- Browser checks at 320px and 390px found no horizontal overflow on search, events and detail pages; sharing buttons measure 44px high. Copy link produced the canonical public URL. Native share opened and Escape cancelled it, returning both controls to their enabled state without a false success message.
