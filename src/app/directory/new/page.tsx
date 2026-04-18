import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DirectoryForm } from "./DirectoryForm";

export default async function NewDirectoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/directory/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Add a community group
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Help others find your organisation. Include how new people can get involved.
      </p>
      <div className="mt-8">
        <DirectoryForm />
      </div>
    </div>
  );
}
