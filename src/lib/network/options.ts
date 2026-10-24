export const COUNCIL_AREAS = ["Byron", "Ballina", "Lismore", "Richmond Valley", "Kyogle", "Elsewhere in the Northern Rivers", "Outside the Northern Rivers"] as const;
export const NETWORK_INTERESTS = ["Shared equipment", "Workshops and skill shares", "Growing space", "Volunteering", "Connecting my group", "General membership"] as const;
export const ENQUIRY_KINDS = ["membership", "contact"] as const;
export type EnquiryKind = (typeof ENQUIRY_KINDS)[number];
export type EnquiryInput = { kind: EnquiryKind; name: string; email: string; area: string; interests: string[]; message: string };
export type EnquiryState = { success: boolean; error?: string };

/** Public forms are intentionally open to visitors; contact details stay private. */
export function parseEnquiry(form: FormData): EnquiryInput {
  function value(key: string, maximum: number, required = true) {
    const raw = form.get(key);
    if (typeof raw !== "string" || raw.length > maximum) throw new Error("Please check the form fields and their length.");
    const text = raw.trim();
    if (required && !text) throw new Error("Please fill in all required fields.");
    return text;
  }
  const kind = value("kind", 20);
  if (!ENQUIRY_KINDS.includes(kind as EnquiryKind)) throw new Error("Please reload this page and try again.");
  const name = value("name", 150);
  const email = value("email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address.");
  const area = value("area", 80, kind === "membership");
  if (area && !COUNCIL_AREAS.includes(area as (typeof COUNCIL_AREAS)[number])) throw new Error("Please choose a council area from the list.");
  const interests = [...new Set(form.getAll("interests"))];
  if (interests.length > NETWORK_INTERESTS.length || interests.some(x => typeof x !== "string" || !NETWORK_INTERESTS.includes(x as (typeof NETWORK_INTERESTS)[number]))) throw new Error("Please choose interests from the list.");
  const message = value("message", 2000, kind === "contact");
  if (form.get("consent") !== "yes") throw new Error("Please confirm that the team can use these details to respond.");
  return { kind: kind as EnquiryKind, name, email, area, interests: (interests as string[]).sort(), message };
}

export function canManageEnquiries(role: string | undefined): boolean { return role === "admin"; }
