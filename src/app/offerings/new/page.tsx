import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OfferingForm } from "./OfferingForm";

export default async function NewOfferingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/offerings/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Post an exchange listing
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Share what you can offer or what you are looking for. Listings appear in Exchange.
      </p>
      <div className="mt-8">
        <OfferingForm />
      </div>
    </div>
  );
}
