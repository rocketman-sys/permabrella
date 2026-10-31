import type { Metadata } from "next";
import { SITE_ORIGIN } from "./site";

export const shareImage = {
  url: `${SITE_ORIGIN}/brand/share-permabrella-v2.png`,
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Umbrella and growing plant above the lowercase permabrella wordmark on a cream background",
};

function shareImageUrl(value?: string | null): string | null {
  if (!value || value.startsWith("//") || value.includes("\\")) return null;
  try {
    const url = new URL(value, value.startsWith("/") ? SITE_ORIGIN : undefined);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function pageMetadata({ title, description, path, imageUrl }: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
}): Metadata {
  const url = new URL(path, SITE_ORIGIN).href;
  const cleanDescription = description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const summary = cleanDescription.length > 200 ? `${cleanDescription.slice(0, 197).trimEnd()}…` : cleanDescription;
  const image = shareImageUrl(imageUrl);
  const images = image ? [{ url: image, alt: title }] : [shareImage];
  return {
    title,
    description: summary,
    alternates: { canonical: url },
    openGraph: { title, description: summary, url, siteName: "PermaBrella", locale: "en_AU", type: "website", images },
    twitter: { card: "summary_large_image", title, description: summary, images },
  };
}
