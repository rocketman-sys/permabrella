import type { PostWithAuthor } from "@/lib/posts/service";
import { getCalendarEvent, googleCalendarUrl } from "@/lib/posts/calendar";
import { isPastListing } from "@/lib/posts/freshness";

export function AddToCalendar({ post }: { post: PostWithAuthor["post"] }) {
  if (post.type !== "event" || isPastListing(post)) return null;
  const event = getCalendarEvent(post);
  if (!event) return <p className="mt-5 text-sm text-[var(--pb-ink-soft)]">Calendar saving will be available once a date and time are confirmed.</p>;
  const linkClass = "flex min-h-11 items-center rounded-lg px-3 py-3 text-sm font-semibold text-[var(--pb-primary)] underline underline-offset-4 hover:bg-[var(--pb-bg)] focus-visible:outline-2 focus-visible:outline-offset-2";
  return <details className="mt-5 max-w-xl rounded-lg border border-[var(--pb-line)] bg-[var(--pb-surface)]">
    <summary className="min-h-11 cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold text-[var(--pb-primary)] focus-visible:outline-2 focus-visible:outline-offset-2">Add to calendar</summary>
    <div className="border-t border-[var(--pb-line)] px-3 pb-4 pt-1">
      <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={linkClass}>Google Calendar <span className="sr-only">(opens in a new tab)</span></a>
      <a href={`/events/${post.id}/calendar`} download={`permabrella-${post.id}.ics`} className={linkClass}>Apple / Outlook / other calendar (.ics)</a>
      <p className="mt-2 px-3 text-xs leading-relaxed text-[var(--pb-ink-soft)]">Save the event in your calendar, then book separately if needed. Saved entries won’t update automatically; check the listing for changes.</p>
      {!event.end ? <p className="mt-2 px-3 text-xs leading-relaxed text-[var(--pb-ink-soft)]">The finishing time isn’t listed. Confirm it before setting a duration.</p> : null}
    </div>
  </details>;
}
