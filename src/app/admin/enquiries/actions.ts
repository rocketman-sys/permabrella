"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { networkEnquiries } from "@/lib/db/schema";
import { requireEnquiryAdmin } from "@/lib/network/service";

export async function setEnquiryStatus(form: FormData) {
  await requireEnquiryAdmin();
  const id = form.get("id");
  const status = form.get("status");
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id) || (status !== "new" && status !== "reviewed")) throw new Error("Invalid enquiry update");
  await db.update(networkEnquiries).set({ status }).where(eq(networkEnquiries.id, id));
  revalidatePath("/admin/enquiries");
}
