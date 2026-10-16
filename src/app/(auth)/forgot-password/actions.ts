"use server";

import { headers } from "next/headers";
import { requestPasswordReset } from "@/lib/auth/reset";

export type RecoveryState = { success?: boolean; error?: string } | null;
export async function requestResetAction(_state: RecoveryState, formData: FormData): Promise<RecoveryState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return { error: "Enter a valid email address." };
  try {
    const h = await headers();
    const ip = h.get("x-vercel-forwarded-for") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    await requestPasswordReset(email, ip);
    return { success: true };
  } catch {
    console.error("[password-reset] Recovery request could not be processed.");
    return { error: "Password recovery is temporarily unavailable. Please try again shortly." };
  }
}
