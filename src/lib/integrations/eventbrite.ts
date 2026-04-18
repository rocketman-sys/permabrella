import { stripHtml } from "@/lib/posts/text";
import { upsertImportedEvent } from "@/lib/posts/service";
import type { Region } from "@/lib/regions";

type EbText = { text?: string; html?: string };
type EbVenue = {
  name?: string;
  address?: {
    localized_area_display?: string;
    localized_address_display?: string;
  };
};

type EbEvent = {
  id: string;
  name?: EbText;
  description?: EbText;
  start?: { utc?: string };
  url?: string;
  logo?: { url?: string };
  venue?: EbVenue | null;
};

type EbListResponse = {
  events?: EbEvent[];
  pagination?: {
    page_number?: number;
    page_count?: number;
  };
};

function parseRegionFromEnv(): Region | null {
  const v = process.env.EVENTBRITE_DEFAULT_REGION?.trim();
  if (!v) return null;
  return v as Region;
}

function mapEvent(ev: EbEvent, defaultRegion: Region | null) {
  const title =
    ev.name?.text?.trim() ||
    ev.name?.html?.trim() ||
    `Event ${ev.id}`;
  const rawDesc = ev.description?.text || ev.description?.html || "";
  const description = stripHtml(rawDesc) || "Imported from Eventbrite.";
  const start = ev.start?.utc ? new Date(ev.start.utc) : null;
  const venue = ev.venue;
  const locationParts = [
    venue?.name,
    venue?.address?.localized_address_display,
    venue?.address?.localized_area_display,
  ].filter(Boolean);
  const locationDetail = locationParts.length
    ? locationParts.join(" — ")
    : null;

  return {
    externalId: ev.id,
    source: "eventbrite" as const,
    title: title.slice(0, 300),
    description: description.slice(0, 50000),
    eventDate: start && !Number.isNaN(start.getTime()) ? start : null,
    externalUrl: ev.url || `https://www.eventbrite.com/e/${ev.id}`,
    imageUrl: ev.logo?.url || null,
    locationDetail,
    region: defaultRegion,
    metadata: { eventbrite: { id: ev.id } },
  };
}

export async function syncEventbriteEvents(): Promise<{
  ok: boolean;
  error?: string;
  imported: number;
  updated: number;
}> {
  const token = (
    process.env.EVENTBRITE_PRIVATE_TOKEN ||
    process.env.EVENTBRITE_API_KEY ||
    ""
  ).trim();
  const orgId = process.env.EVENTBRITE_ORG_ID?.trim();
  if (!token || !orgId) {
    return {
      ok: true,
      imported: 0,
      updated: 0,
      error:
        "EVENTBRITE_PRIVATE_TOKEN (or EVENTBRITE_API_KEY) and EVENTBRITE_ORG_ID not set; skipped.",
    };
  }

  const defaultRegion = parseRegionFromEnv();
  let imported = 0;
  let updated = 0;
  let page = 1;
  let pageCount = 1;

  try {
    while (page <= pageCount) {
      const url = new URL(
        `https://www.eventbriteapi.com/v3/organizations/${orgId}/events/`
      );
      url.searchParams.set("status", "live");
      url.searchParams.set("expand", "venue");
      url.searchParams.set("page", String(page));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          ok: false,
          imported,
          updated,
          error: `Eventbrite API ${res.status}: ${text.slice(0, 500)}`,
        };
      }

      const data = (await res.json()) as EbListResponse;
      const list = data.events ?? [];
      pageCount = data.pagination?.page_count ?? 1;

      for (const ev of list) {
        const mapped = mapEvent(ev, defaultRegion);
        const result = await upsertImportedEvent(mapped);
        if (result === "inserted") imported += 1;
        else updated += 1;
      }

      page += 1;
    }

    return { ok: true, imported, updated };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, imported, updated, error: message };
  }
}
