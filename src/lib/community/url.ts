import { SITE_ORIGIN } from "@/lib/site";

/** Base URL for links in emails and redirects (no trailing slash). */
export function getPublicBaseUrl(): string {
  const explicit =
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  if (process.env.NODE_ENV === "production") return SITE_ORIGIN;
  return "http://localhost:3000";
}

export function threadPublicPath(topicSlug: string, threadId: string): string {
  return `/community/${topicSlug}/${threadId}`;
}

export function threadPublicUrl(topicSlug: string, threadId: string): string {
  return `${getPublicBaseUrl()}${threadPublicPath(topicSlug, threadId)}`;
}
