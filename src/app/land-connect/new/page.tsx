import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandForm } from "./LandForm";

export default async function NewLandPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/land-connect/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Post a land listing
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Share land available for growing or a request for land access.
      </p>
      <div className="mt-8">
        <LandForm />
      </div>
    </div>
  );
}
