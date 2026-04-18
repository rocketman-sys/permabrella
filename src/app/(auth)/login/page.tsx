import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-[var(--perm-card)] ring-1 ring-[var(--perm-border)]" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
