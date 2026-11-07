# Byron Farmers Network update — 7 November 2026

Source: the Byron Shire Council newsletter supplied by the user. Public organiser pages were checked before preparing the additions in `data/events-survey-byron-farmers-2026-11-07.json`.

## Listings

- **Rehydrate Australia, Pearces Creek Hall, 14 November:** doors and supper at 6:30pm AEDT; event header ends at 9pm. The organiser gives both 7:15pm and 7:30pm for the screening start, so that conflict is visible in the listing. Advertised adult admission is $5; children 16 and under are free. Source: https://events.humanitix.com/rehydrate-australia-screening-and-q-and-a-at-pearces-creek-hall
- **Natural Sequence Farming, Banyula Farm, 15 November:** already present as `3350b48c-6838-5ecf-8122-fb09d6789e3e`. The supplied canonical booking link confirms the existing 9am–3:30pm AEDT schedule, Clunes address and $50 price. Do not create another record. Source: https://events.tarwynparktraining.com.au/events/tarwynparktraining/2415986
- **North Coast Beef Producers Field Day, 3 December:** 8:30am arrival for a 9am start, finishing at 2pm AEDT, at Grafton Primary Industries Institute, Trenayr. Free registration. Source: https://events.humanitix.com/north-coast-beef-producers-field-day-dec-2026
- **World Soil Day Competition:** clearly labelled as an entry deadline. Official terms specify 4 December 2026 at 11:59pm AEST, equivalent to 5 December at 12:59am AEDT. Both the stored deadline and expiry use the actual instant; the description retains the organiser’s published Queensland date. The prizes are assessment services, not cash grants. Source: https://www.unisq.edu.au/research/sqnnsw-hub/wsd and its linked 2026 terms.
- **Darren Doherty agroforestry recordings:** one undated “watch anytime” listing with both videos. YouTube’s public oEmbed responses returned HTTP 200, matching titles and the ByronShireCouncil publisher. No new workshop date or booking is implied. Sources: https://www.youtube.com/watch?v=86L9xPeMiM8 and https://www.youtube.com/watch?v=e1PPpjAKduQ

## Display and import behaviour

The existing events list can include undated resources. `eventKind: recording` now suppresses calendar booking copy and gives the external link a “Watch recordings” label. `eventKind: competition` similarly uses “Competition details & entry” and does not export a gathering to a calendar. Ordinary event calendar behaviour is unchanged.

The guarded survey importer accepts null dates only for explicitly identified recordings with recording evidence. It also accepts an explicit expiry and verifies it on repeat imports. The existing source checks, duplicate detection, temporary transaction trial, atomic apply, private backup and guarded rollback remain in place.

## Checks and publication

Before publication, the four proposed inserts passed a temporary-table transaction against the existing 37-event database, without changing public rows. The calendar, freshness and verification test suites passed (21 tests); TypeScript and targeted lint passed.

```sh
node --env-file=.env.local --import tsx scripts/refresh-local-events.ts --file=data/events-survey-byron-farmers-2026-11-07.json
node --env-file=.env.local --import tsx scripts/refresh-local-events.ts --file=data/events-survey-byron-farmers-2026-11-07.json --test-transaction
# Publish after the reviewed display change is live:
node --env-file=.env.local --import tsx scripts/refresh-local-events.ts --file=data/events-survey-byron-farmers-2026-11-07.json --apply
```

Re-running the dry run after application verifies an unchanged batch and makes no additional records. Private backups stay outside Git. Verify the public events list, all new detail pages, the two ordinary event calendar downloads and both recording links after publication.
