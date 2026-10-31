import { cache } from "react";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getActivePostByIdInTypes, getDirectoryCanonicalId } from "./service";
import { pageMetadata } from "@/lib/metadata";
import { listingFreshness } from "./freshness";
import type { PostWithAuthor } from "./service";

const listingTypes = {
  events: ["event"],
  directory: ["directory_entry"],
  grants: ["grant"],
  offerings: ["offering", "wanted"],
  "land-connect": ["land_available", "land_wanted"],
  news: ["news"],
} satisfies Record<string, PostWithAuthor["post"]["type"][]>;
export type ListingSection = keyof typeof listingTypes;

// One public-record lookup per request, shared by the page and its social preview.
export const getPublicListing = cache(async (id: string, section: ListingSection) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const item = await getActivePostByIdInTypes(id, listingTypes[section]);
  if (item) return item;
  if (section === "events") {
    const moved = await getActivePostByIdInTypes(id, ["land_available", "land_wanted"]);
    if (moved?.post.metadata.previousType === "event") permanentRedirect(`/land-connect/${id}`);
  }
  if (section === "directory") {
    const canonical = await getDirectoryCanonicalId(id);
    if (canonical) redirect(`/directory/${canonical}`);
  }
  notFound();
});

export async function listingMetadata(id: string, section: ListingSection) {
  const { post } = await getPublicListing(id, section);
  const freshness = listingFreshness(post);
  const status = ["event", "grant"].includes(post.type) ? `${freshness.label}. ${freshness.note} ` : "";
  return pageMetadata({
    title: `${post.title} | PermaBrella`,
    description: `${status}${post.description.split("\n\n")[0]}`,
    path: `/${section}/${post.id}`,
    imageUrl: post.imageUrl,
  });
}
