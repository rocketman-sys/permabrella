import catalog from "../../../data/grant-applicants.json";
import { isPastListing, type FreshnessPost } from "./freshness";

export const APPLICANT_OPTIONS = [
  { value: "all", label: "All applicants" },
  { value: "individual", label: "Individuals & landholders" },
  { value: "community", label: "Community organisations" },
  { value: "council", label: "Local councils" },
  { value: "unknown", label: "Eligibility to confirm" },
] as const;
export const FUNDING_OPTIONS = [
  { value: "all", label: "All current & undated" },
  { value: "open", label: "Open rounds" },
  { value: "rolling", label: "Rolling applications" },
  { value: "upcoming", label: "Upcoming rounds" },
  { value: "check", label: "Check with provider" },
  { value: "closed", label: "Past & closed" },
] as const;
export type ApplicantFilter = (typeof APPLICANT_OPTIONS)[number]["value"];
export type FundingFilter = (typeof FUNDING_OPTIONS)[number]["value"];
type Grant = FreshnessPost & { id: string };
type QueryValue = string | string[] | undefined;

export function parseGrantFilters(query: { applicant?: QueryValue; funding?: QueryValue; view?: QueryValue }) {
  const applicant = APPLICANT_OPTIONS.find((option) => option.value === query.applicant)?.value ?? "all";
  // Preserve links to the former Past & closed tab.
  const funding = FUNDING_OPTIONS.find((option) => option.value === query.funding)?.value
    ?? (query.view === "past" ? "closed" : "all");
  return { applicant, funding };
}

const applicantCatalog = new Map(catalog.entries.map((entry) => [entry.id, entry]));
const normalise = (value: string) => value.trim().replace(/\s+/g, " ");

export function grantApplicants(post: Grant): string[] {
  const entry = applicantCatalog.get(post.id);
  // A community edit can change eligibility: never retain an outdated category.
  return entry && typeof post.metadata.whoCanApply === "string"
    && normalise(entry.eligibility) === normalise(post.metadata.whoCanApply)
    ? entry.applicants : [];
}

export function grantFundingStatus(post: Grant, now = new Date()): Exclude<FundingFilter, "all"> | "resource" {
  if (post.metadata.statusLabel === "Ongoing resource") return "resource";
  if (isPastListing(post, now)) return "closed";
  if (post.metadata.statusLabel === "Upcoming - check opening") return "upcoming";
  if (post.metadata.statusLabel === "Rolling applications") return "rolling";
  if (post.metadata.statusLabel === "Open now") return "open";
  return "check";
}

export function matchesGrantFilters(post: Grant, filters: { applicant: ApplicantFilter; funding: FundingFilter }, now = new Date()) {
  if (post.type !== "grant" || !["active", "expired"].includes(post.status)) return false;
  const status = grantFundingStatus(post, now);
  if (status === "resource") return false;
  if (filters.funding === "all" ? status === "closed" : status !== filters.funding) return false;
  const applicants = grantApplicants(post);
  return filters.applicant === "all" || (filters.applicant === "unknown" ? applicants.length === 0 : applicants.includes(filters.applicant));
}
