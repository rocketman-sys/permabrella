import assert from "node:assert/strict";
import test from "node:test";
import { eventCalendarFile, getCalendarEvent, googleCalendarUrl } from "./calendar";
import { parseSydneyDateTime } from "./dates";

const now = new Date("2026-11-01T01:00:00Z");
const post: Parameters<typeof getCalendarEvent>[0] = {
  id: "459207a1-f3cb-5dd7-b26b-11826deeaaf4", type: "event", status: "active",
  title: "Community breakfast", description: "Meet local growers.",
  eventDate: parseSydneyDateTime("2026-11-05T07:00"), expiresAt: null,
  metadata: { eventEnd: "2026-11-05T09:00:00+11:00", eventTimeConfirmed: true },
  locationDetail: "Mullumbimby, NSW", externalUrl: "https://example.org/booking", createdAt: now, updatedAt: now,
};
test("Google and ICS use the same absolute times across NSW daylight saving", () => {
  for (const [local, end, startUTC, endUTC, before] of [
    ["2026-11-05T07:00", "2026-11-05T09:00:00+11:00", "20261104T200000Z", "20261104T220000Z", now],
    ["2026-07-05T07:00", "2026-07-05T09:00:00+10:00", "20260704T210000Z", "20260704T230000Z", new Date("2026-07-01T00:00:00Z")],
  ] as const) {
    const event = getCalendarEvent({ ...post, eventDate: parseSydneyDateTime(local), metadata: { eventEnd: end } }, before)!;
    const query = new URL(googleCalendarUrl(event)).searchParams;
    assert.equal(query.get("dates"), `${startUTC}/${endUTC}`);
    assert.equal(query.get("ctz"), "Australia/Sydney");
    const ics = eventCalendarFile(event, now);
    assert.ok(ics.includes(`DTSTART:${startUTC}\r\nDTEND:${endUTC}`));
    assert.equal(query.get("text"), post.title);
  }
});
test("undated, unconfirmed, expired and unpublished events cannot be exported", () => {
  for (const invalid of [
    { ...post, eventDate: null }, { ...post, eventDate: new Date("invalid") },
    { ...post, metadata: { eventTimeConfirmed: false } }, { ...post, status: "expired" as const },
    { ...post, status: "pending_moderation" as const }, { ...post, type: "grant" as const },
    { ...post, eventDate: new Date("2026-10-30T00:00:00Z") },
  ]) assert.equal(getCalendarEvent(invalid, now), null);
});
test("unknown or invalid end times do not invent a duration", () => {
  for (const eventEnd of [undefined, "bad", "2026-11-05T09:00:00", "2026-11-04T09:00:00+11:00"]) {
    const event = getCalendarEvent({ ...post, metadata: { eventEnd } }, now)!;
    assert.equal(event.end, null);
    assert.ok(!eventCalendarFile(event, now).includes("DTEND:"));
    assert.match(event.description, /Finishing time is not listed/);
  }
});
test("exports retain verification caveats, latest listing and booking separately", () => {
  const event = getCalendarEvent({ ...post, metadata: { ...post.metadata, verificationNote: "Booking form still shows an old date." } }, now)!;
  assert.match(event.description, /Details to confirm: Booking form still shows an old date/);
  assert.ok(event.description.includes(event.url));
  assert.ok(event.description.includes(post.externalUrl!));
  assert.match(event.description, /do not update automatically/);
  assert.equal(new URL(googleCalendarUrl(event)).searchParams.get("details"), event.description);
});
test("ICS safely escapes text, folds Unicode by bytes and keeps a stable identity", () => {
  const title = "Grow, share; thrive \\ 🌱 ".repeat(10) + "\r\nATTENDEE:injected@example.org";
  const event = getCalendarEvent({ ...post, title }, now)!;
  const file = eventCalendarFile(event, now);
  assert.ok(file.endsWith("END:VCALENDAR\r\n"));
  assert.ok(!file.replace(/\r\n/g, "").includes("\n"));
  for (const line of file.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  const unfolded = file.replace(/\r\n /g, "");
  assert.ok(unfolded.includes(`UID:${post.id}@permabrella.org`));
  assert.ok(unfolded.includes("\\nATTENDEE:"));
  assert.ok(!unfolded.includes("\r\nATTENDEE:"));
  assert.ok(unfolded.includes("Grow\\, share\\; thrive \\\\ 🌱"));
  assert.ok(!file.includes("BEGIN:VALARM"));
});
