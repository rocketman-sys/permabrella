"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { parseEnquiry, type EnquiryState } from "@/lib/network/options";
import { notifyEnquiryTeam, saveEnquiry } from "@/lib/network/service";

export async function submitNetworkEnquiry(_previous: EnquiryState, form: FormData): Promise<EnquiryState> {
  // Honeypot is hidden from people and assistive technology; never store its contents.
  if (form.get("website")) return { success: true };
  let input;
  try { input = parseEnquiry(form); }
  catch (error) { return { success: false, error: error instanceof Error ? error.message : "Please check your details." }; }
  try {
    const requestHeaders = await headers();
    // Vercel overwrites this header; do not trust arbitrary forwarded headers.
    const ip = process.env.VERCEL ? requestHeaders.get("x-vercel-forwarded-for") ?? "unknown" : "local";
    const saved = await saveEnquiry(input, ip);
    if (!saved.allowed) return { success: false, error: "You’ve sent several enquiries recently. Please try again in an hour." };
    if (saved.id) after(notifyEnquiryTeam);
    return { success: true };
  } catch {
    console.error("[network-enquiry] Submission could not be saved.");
    return { success: false, error: "Your enquiry could not be saved. Please keep your details here and try again shortly." };
  }
}
