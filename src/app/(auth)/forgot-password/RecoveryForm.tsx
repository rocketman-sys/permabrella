"use client";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { requestResetAction } from "./actions";

export function RecoveryForm() {
  const [state, action, pending] = useActionState(requestResetAction, null);
  if (state?.success) return <p role="status" className="mt-5 rounded-lg bg-[var(--pb-bg)] p-4 text-sm">If an account matches that email, we’ll send a reset link. Check your inbox and spam folder. The link is valid for 30 minutes. Please wait a minute before requesting another.</p>;
  return <form action={action} className="mt-5 space-y-4">
    <div><label htmlFor="recovery-email" className="text-sm font-medium">Email address</label><Input id="recovery-email" name="email" type="email" autoComplete="email" maxLength={255} required className="mt-1" /></div>
    {state?.error ? <p role="alert" className="text-sm text-red-700">{state.error}</p> : null}
    <Button type="submit" disabled={pending} className="w-full">{pending ? "Requesting link…" : "Send reset link"}</Button>
  </form>;
}
