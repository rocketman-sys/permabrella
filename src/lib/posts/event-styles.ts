/** Style groups for the events list, matched from the public listing wording. */
export const EVENT_STYLES = [
  { id: "markets", label: "Markets" },
  { id: "talks", label: "Talks & webinars" },
  { id: "workshops", label: "Workshops" },
  { id: "field-trips", label: "Field days & outings" },
  { id: "working-bees", label: "Working bees" },
  { id: "meetups", label: "Swaps & meet-ups" },
] as const;

export type EventStyle = (typeof EVENT_STYLES)[number]["id"];

export function parseEventStyle(value: string | null | undefined): EventStyle | null {
  return EVENT_STYLES.some((style) => style.id === value) ? (value as EventStyle) : null;
}

export function eventStyleLabel(style: EventStyle): string {
  return EVENT_STYLES.find((item) => item.id === style)?.label ?? "Events";
}

/**
 * First matching group wins, so a market that also mentions a swap stays a market,
 * and a webinar that mentions workshop materials stays a talk.
 */
export function eventStyle(input: { title: string; description?: string | null }): EventStyle | null {
  const title = input.title.toLowerCase();
  const text = `${title} ${input.description ?? ""}`.toLowerCase();
  if (/\bmarkets?\b/.test(title)) return "markets";
  if (/\b(working bees?|tree planting|plantings?|clean[- ]?ups?|creek walks?|tea and gardening)\b/.test(title)) return "working-bees";
  if (/\b(workshops?|skill shares?|hands-on)\b/.test(title)) return "workshops";
  if (/\b(field days?|field trips?|bioblitz|mothing|tours?|citizen science)\b/.test(title)) return "field-trips";
  if (/\b(webinars?|presentations?|films?|dialogues?)\b/.test(title) || /\b(discussion|agm)\b/.test(title) || /\bin the \w+ hall\b/.test(title) || /\bonline (session|discussion|launch|briefing)\b/.test(text) || (!/\bworkshops?\b/.test(title) && /\b(panels?|q&a)\b/.test(text))) return "talks";
  if (/\b(workshops?|skill shares?|hands-on)\b/.test(text)) return "workshops";
  if (/\b(swaps?|singing|kettle|lunch(?:es)?|breakfasts?|picnics?|festivals?)\b/.test(title)) return "meetups";
  return null;
}
