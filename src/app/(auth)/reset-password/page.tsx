import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { validResetToken } from "@/lib/auth/reset";
import { ResetForm } from "./ResetForm";
export const metadata: Metadata = { title: "Choose a new password | PermaBrella", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  return <div className="mx-auto max-w-md px-4 py-10"><Card><h1 className="text-2xl font-semibold">Choose a new password</h1>{validResetToken(token) ? <ResetForm token={token} /> : <p className="mt-4 text-sm">This link is incomplete. <Link href="/forgot-password" className="text-[var(--pb-accent-2)] underline">Request a new reset link</Link>.</p>}</Card></div>;
}
