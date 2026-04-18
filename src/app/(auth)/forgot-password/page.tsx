import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <h1 className="text-xl font-semibold text-[var(--perm-primary)]">Forgot password</h1>
        <p className="mt-3 text-sm text-[var(--perm-text-secondary)]">
          Password reset by email is not wired up yet. For now, contact your site
          administrator or create a new account with a different email if you are locked
          out.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/login" className="font-medium text-[var(--perm-secondary)] hover:underline">
            Back to log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
