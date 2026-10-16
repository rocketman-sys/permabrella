import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { RecoveryForm } from "./RecoveryForm";
import { resend } from "@/lib/email";
export const metadata: Metadata = { title: "Reset your password | PermaBrella", robots: { index: false, follow: false } };
export default function ForgotPasswordPage() {
  return <div className="mx-auto max-w-md px-4 py-10"><Card>
    <h1 className="text-2xl font-semibold">Forgot your password?</h1>
    {resend && process.env.EMAIL_FROM ? <>
      <p className="mt-3 text-sm text-[var(--pb-ink-soft)]">Enter the email address you used to join. We’ll send you a link to choose a new password.</p>
      <RecoveryForm />
    </> : <p className="mt-3 text-sm text-[var(--pb-ink-soft)]" role="status">Password reset emails are temporarily unavailable. Please try again later.</p>}
    <Link href="/login" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline">Back to log in</Link>
  </Card></div>;
}
