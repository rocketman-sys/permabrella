import type { FreshnessPost } from "./freshness";
import { isPastListing, listingFreshness } from "./freshness";

/** Directory listings remain discoverable; homepage highlights need current details. */
export function isHomepageOpportunity(post: FreshnessPost, now = new Date()): boolean {
  if (post.status !== "active" || isPastListing(post, now)) return false;
  if (post.metadata.landConnectCategory || post.metadata.communityEdited === true) return false;
  if (typeof post.metadata.verificationNote === "string" && post.metadata.verificationNote.trim()) return false;
  if (typeof post.metadata.listingLabel === "string" && post.metadata.listingLabel.trim()) return false;
  return listingFreshness(post, now).tone === "green";
}
