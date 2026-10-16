"use server";
import { completePasswordReset, validResetPassword } from "@/lib/auth/reset";
export type ResetState = { success?: boolean; error?: string } | null;
export async function resetPasswordAction(_state: ResetState, formData: FormData): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!validResetPassword(password)) return { error: "Use at least 8 characters and no more than 72 bytes (usually 72 characters)." };
  if (password !== String(formData.get("confirmPassword") ?? "")) return { error: "The passwords don’t match." };
  try {
    if (!await completePasswordReset(token, password)) return { error: "This reset link has expired or has already been used. Request a new link." };
    return { success: true };
  } catch {
    console.error("[password-reset] Password update failed.");
    return { error: "We couldn’t update your password. Please try again shortly." };
  }
}
