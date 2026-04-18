import { stripHtml } from "@/lib/posts/text";
import { upsertImportedEvent } from "@/lib/posts/service";
import type { Region } from "@/lib/regions";

type HxEvent = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  startDate?: string;
  start?: string;
  date?: string;
  url?: string;
  eventUrl?: string;
  link?: string;
  image?: string;
  imageUrl?: string;
  location?: { name?: string; address?: string } | string;
  venue?: { name?: string; address?: string };
};

type HxListResponse = {
  events?: HxEvent[];
  data?: HxEvent[];
  total?: number;
  page?: number;
  pageSize?: number;
};

function parseRegionFromEnv(): Region | null {
  const v = process.env.HUMANITIX_DEFAULT_REGION?.trim();
  if (!v) return null;
  return v as Region;
}

function eventId(ev: HxEvent): string {
  return (ev._id || ev.id || "").trim();
}

function eventTitle(ev: HxEvent): string {
  return (ev.name || ev.title || "Untitled event").trim();
}

function eventDescription(ev: HxEvent): string {
  const raw = ev.description || ev.summary || "";
  const text = stripHtml(raw);
  return text || "Imported from Humanitix.";
}

function eventStart(ev: HxEvent): Date | null {
  const s = ev.startDate || ev.start || ev.date;
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function eventUrl(ev: HxEvent, id: string): string {
  const u = ev.url || ev.eventUrl || ev.link;
  if (u?.startsWith("http")) return u;
  return `https://events.humanitix.com/${id}`;
}

function eventImage(ev: HxEvent): string | null {
  const u = ev.image || ev.imageUrl;
  return u?.startsWith("http") ? u : null;
}

function eventLocation(ev: HxEvent): string | null {
  if (typeof ev.location === "string") return ev.location || null;
  const loc = ev.location || ev.venue;
  if (loc && typeof loc === "object") {
    const parts = [loc.name, loc.address].filter(Boolean);
    if (parts.length) return parts.join(" — ");
  }
  return null;
}

export async function syncHumanitixEvents(): Promise<{
  ok: boolean;
  error?: string;
  imported: number;
  updated: number;
}> {
  const apiKey = process.env.HUMANITIX_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: true,
      imported: 0,
      updated: 0,
      error: "HUMANITIX_API_KEY not set; skipped.",
    };
  }

  const defaultRegion = parseRegionFromEnv();
  let imported = 0;
  let updated = 0;
  let page = 1;
  const pageSize = 50;
  let totalProcessed = 0;
  let reportedTotal: number | undefined;

  try {
    while (page <= 50) {
      const url = new URL("https://api.humanitix.com/v1/events");
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(pageSize));
      url.searchParams.set("inFutureOnly", "true");

      const res = await fetch(url.toString(), {
        headers: { "x-api-key": apiKey },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          ok: false,
          imported,
          updated,
          error: `Humanitix API ${res.status}: ${text.slice(0, 500)}`,
        };
      }

      const data = (await res.json()) as HxListResponse;
      const list = data.events ?? data.data ?? [];
      if (reportedTotal === undefined && typeof data.total === "number") {
        reportedTotal = data.total;
      }

      if (!list.length) break;

      for (const ev of list) {
        const id = eventId(ev);
        if (!id) continue;
        const mapped = {
          externalId: id,
          source: "humanitix" as const,
          title: eventTitle(ev).slice(0, 300),
          description: eventDescription(ev).slice(0, 50000),
          eventDate: eventStart(ev),
          externalUrl: eventUrl(ev, id),
          imageUrl: eventImage(ev),
          locationDetail: eventLocation(ev),
          region: defaultRegion,
          metadata: { humanitix: { id } },
        };
        const result = await upsertImportedEvent(mapped);
        if (result === "inserted") imported += 1;
        else updated += 1;
        totalProcessed += 1;
      }

      if (list.length < pageSize) break;
      if (reportedTotal !== undefined && totalProcessed >= reportedTotal) break;
      page += 1;
    }

    return { ok: true, imported, updated };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, imported, updated, error: message };
  }
}
