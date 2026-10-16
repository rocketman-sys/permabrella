"use server";

import { auth } from "@/lib/auth";
import { parseRegionParam } from "@/lib/regions";
import { createUserPost } from "@/lib/posts/service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseSydneyDateTime } from "@/lib/posts/dates";

export type FormState = { error?: string } | null;

export async function createLandListingAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in." };

  const listingType = String(formData.get("listingType") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const regionRaw = String(formData.get("region") ?? "").trim();
  const locationDetail = String(formData.get("locationDetail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactMethod = String(formData.get("contactMethod") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const expiresRaw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresRaw ? parseSydneyDateTime(expiresRaw) : null;
  if (expiresRaw && !expiresAt) return { error: "Please enter a valid availability end date and time." };

  if (listingType !== "land_available" && listingType !== "land_wanted") {
    return { error: "Choose land available or land wanted." };
  }
  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  const region = regionRaw ? parseRegionParam(regionRaw) : undefined;
  if (regionRaw && !region) {
    return { error: "Please choose a valid region or leave it blank." };
  }

  const id = await createUserPost({
    authorId: session.user.id,
    type: listingType,
    title,
    description,
    region: region ?? null,
    locationDetail: locationDetail || null,
    contactPhone: contactPhone || null,
    contactEmail: contactEmail || null,
    contactMethod: contactMethod || null,
    externalUrl: externalUrl || null,
    imageUrl: imageUrl || null,
    expiresAt,
    tags: ["land-connect", listingType],
  });

  revalidatePath("/land-connect");
  revalidatePath("/");
  redirect(`/land-connect/${id}`);
}
