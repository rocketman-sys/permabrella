import type { posts } from "@/lib/db/schema";
import { formatEventWhen, formatPosted } from "./format";
import { sydneyDayStart } from "./dates";

export type FreshnessPost = Pick<typeof posts.$inferSelect,
  "type" | "status" | "eventDate" | "expiresAt" | "createdAt" | "updatedAt" | "metadata">;

export function isPastListing(post: FreshnessPost, now = new Date()): boolean {
  return post.status === "expired" ||
    Boolean(post.expiresAt && post.expiresAt <= now) ||
    Boolean(post.type === "event" && post.eventDate && post.eventDate < sydneyDayStart(now)) ||
    (post.type === "grant" && post.metadata.statusLabel === "Closed - track next round");
}

export function listingFreshness(post: FreshnessPost, now = new Date()) {
  const past = isPastListing(post, now);
  const old = now.getTime() - post.updatedAt.getTime() > 90 * 24 * 60 * 60 * 1000;
  if (past) return { label: post.type === "event" ? "Past event" : post.type === "grant" ? "Closed round" : "Expired listing", note: "Kept for reference. Check with the organiser for any new opportunity.", tone: "muted" as const };
  if (post.type === "event") return post.eventDate
    ? { label: "Scheduled event", note: formatEventWhen(post.eventDate)!, tone: "green" as const }
    : { label: "Date to be arranged", note: "Contact the organiser to confirm the date and whether help is still needed.", tone: "amber" as const };
  if (post.type === "grant") {
    if (post.metadata.statusLabel === "Ongoing resource") return { label: "Funding directory", note: "Browse the provider’s website for individual funding rounds.", tone: "green" as const };
    // Date-only deadlines expire at the next NSW midnight without inventing a public cutoff time.
    const deadlineDate = post.metadata.deadlineDate;
    if (post.expiresAt && typeof deadlineDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(deadlineDate)) return { label: "Deadline listed", note: `Applications close ${formatPosted(new Date(`${deadlineDate}T00:00:00Z`))}. Confirm the closing time and eligibility with the provider.`, tone: "green" as const };
    if (post.expiresAt) return { label: "Deadline listed", note: `Applications close ${formatEventWhen(post.expiresAt)}. Confirm eligibility and availability with the provider.`, tone: "green" as const };
    return { label: "Check current round", note: "No current deadline is recorded. Check the provider’s website before preparing an application.", tone: "amber" as const };
  }
  if (["offering", "wanted", "land_available", "land_wanted"].includes(post.type)) {
    return { label: old ? "Confirm availability" : "Community listing", note: post.expiresAt ? `Listed until ${formatEventWhen(post.expiresAt)}.` : "Contact the person who posted this to confirm availability.", tone: old ? "amber" as const : "green" as const };
  }
  return { label: post.type === "news" ? "Community news" : "Community group", note: old ? `Details last updated ${formatPosted(post.updatedAt)}. Check directly for current activities.` : "", tone: "muted" as const };
}
