import type { posts } from "../db/schema";
import { SITE_ORIGIN } from "../site";
import { safePublicUrl } from "../listing-edits/policy";
import { isPastListing } from "./freshness";
import { verificationDetails } from "./verification";

type EventPost = Pick<typeof posts.$inferSelect, "id" | "type" | "status" | "title" | "description" | "eventDate" | "expiresAt" | "createdAt" | "updatedAt" | "metadata" | "locationDetail" | "externalUrl">;
export type CalendarEvent = {
  id: string; title: string; description: string; location: string;
  start: Date; end: Date | null; updated: Date; url: string;
};

export function getCalendarEvent(post: EventPost, now = new Date()): CalendarEvent | null {
  if (post.type !== "event" || post.status !== "active" || isPastListing(post, now)
    || !post.eventDate || !Number.isFinite(post.eventDate.getTime()) || post.metadata.eventTimeConfirmed === false) return null;
  const rawEnd = post.metadata.eventEnd;
  // A timezone-less string depends on the server timezone and must not become a guessed end time.
  const candidate = typeof rawEnd === "string" && /T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(rawEnd) ? new Date(rawEnd) : null;
  const end = candidate && Number.isFinite(candidate.getTime()) && candidate > post.eventDate ? candidate : null;
  const url = `${SITE_ORIGIN}/events/${post.id}`;
  const note = verificationDetails(post.metadata).note;
  const communityNote = typeof post.metadata.communityNote === "string" ? post.metadata.communityNote : "";
  const description = [
    note ? `Details to confirm: ${note}` : "",
    post.metadata.communityEdited === true ? `Community-updated details; confirm with the organiser. ${communityNote}` : "",
    !end ? "Finishing time is not listed. Confirm it with the organiser." : "",
    post.description,
    `Latest listing: ${url}`,
    post.externalUrl && safePublicUrl(post.externalUrl) ? `Event details & booking: ${post.externalUrl}` : "",
    "Check the listing for changes and book separately if required. Saved calendar entries do not update automatically.",
  ].filter(Boolean).join("\n\n");
  return { id: post.id, title: post.title, description, location: post.locationDetail ?? "", start: post.eventDate, end, updated: post.updatedAt, url };
}

function utcStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const query = new URLSearchParams({
    action: "TEMPLATE", text: event.title,
    dates: `${utcStamp(event.start)}/${utcStamp(event.end ?? event.start)}`,
    details: event.description, location: event.location, ctz: "Australia/Sydney",
  });
  return `https://calendar.google.com/calendar/render?${query}`;
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,").replace(/;/g, "\\;")
    // Keep calendar text from injecting additional properties or control sequences.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

// RFC 5545 folds by UTF-8 octets, not JavaScript characters (including the continuation space).
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let result = "", bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) { result += "\r\n "; bytes = 1; }
    result += character;
    bytes += size;
  }
  return result;
}

export function eventCalendarFile(event: CalendarEvent, generated = new Date()): string {
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PermaBrella//Community events//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:${event.id}@permabrella.org`, `DTSTAMP:${utcStamp(generated)}`,
    `LAST-MODIFIED:${utcStamp(event.updated)}`, `DTSTART:${utcStamp(event.start)}`,
    ...(event.end ? [`DTEND:${utcStamp(event.end)}`] : []),
    `SUMMARY:${escapeText(event.title)}`, `DESCRIPTION:${escapeText(event.description)}`,
    ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
    `URL:${event.url}`, "END:VEVENT", "END:VCALENDAR",
  ].map(foldLine).join("\r\n") + "\r\n";
}
