import { getActivePostById } from "@/lib/posts/service";
import { isUuid } from "@/lib/listing-edits/policy";
import { eventCalendarFile, getCalendarEvent } from "@/lib/posts/calendar";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return new Response("Event not found", { status: 404 });
  const item = await getActivePostById(id, "event");
  if (!item) return new Response("Event not found", { status: 404 });
  const event = getCalendarEvent(item.post);
  if (!event) return new Response("A current event with a confirmed date and time is required.", { status: 409, headers: { "Cache-Control": "no-store" } });
  return new Response(eventCalendarFile(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="permabrella-${id}.ics"`,
      "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    },
  });
}
