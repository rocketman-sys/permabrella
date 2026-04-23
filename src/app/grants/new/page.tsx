import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GrantForm } from "./GrantForm";

export default async function NewGrantPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/grants/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Submit a grant listing
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Share funding rounds, philanthropic programs, or in-kind support that others in the
        region can apply for. Listings appear on the grants page.
      </p>
      <div className="mt-8">
        <GrantForm />
      </div>
    </div>
  );
}
