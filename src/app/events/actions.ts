"use server";

import { auth } from "@/lib/auth";
import { parseRegionParam } from "@/lib/regions";
import { createUserPost } from "@/lib/posts/service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FormState = { error?: string } | null;

export async function createEventAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const eventDateRaw = String(formData.get("eventDate") ?? "").trim();
  const regionRaw = String(formData.get("region") ?? "").trim();
  const locationDetail = String(formData.get("locationDetail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactMethod = String(formData.get("contactMethod") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  let eventDate: Date | null = null;
  if (eventDateRaw) {
    const d = new Date(eventDateRaw);
    if (!Number.isNaN(d.getTime())) eventDate = d;
  }

  const region = regionRaw ? parseRegionParam(regionRaw) : undefined;
  if (regionRaw && !region) {
    return { error: "Please choose a valid region or leave it blank." };
  }

  const id = await createUserPost({
    authorId: session.user.id,
    type: "event",
    title,
    description,
    eventDate,
    region: region ?? null,
    locationDetail: locationDetail || null,
    contactPhone: contactPhone || null,
    contactEmail: contactEmail || null,
    contactMethod: contactMethod || null,
    externalUrl: externalUrl || null,
    imageUrl: imageUrl || null,
  });

  revalidatePath("/events");
  revalidatePath("/");
  redirect(`/events/${id}`);
}
