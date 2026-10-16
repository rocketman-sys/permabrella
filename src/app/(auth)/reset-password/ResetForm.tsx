"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPasswordAction } from "./actions";
export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, null);
  if (state?.success) return <div className="mt-5"><p role="status">Your password has been changed. Sign in again with your new password.</p><Link href="/login" className="mt-4 inline-flex rounded-md bg-[var(--pb-primary)] px-4 py-3 font-semibold text-white">Log in</Link></div>;
  return <form action={action} className="mt-5 space-y-4">
    <input type="hidden" name="token" value={token} />
    <div><label htmlFor="new-password" className="text-sm font-medium">New password</label><Input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required className="mt-1" /><p className="mt-1 text-xs text-[var(--pb-muted)]">At least 8 characters.</p></div>
    <div><label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</label><Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={72} required className="mt-1" /></div>
    {state?.error ? <p role="alert" className="text-sm text-red-700">{state.error} <Link href="/forgot-password" className="underline">Request a new link</Link></p> : null}
    <Button type="submit" className="w-full" disabled={pending}>{pending ? "Updating password…" : "Save new password"}</Button>
  </form>;
}
