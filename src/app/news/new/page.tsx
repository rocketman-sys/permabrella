import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewsForm } from "./NewsForm";

export default async function NewNewsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/news/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Add a news item
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Share noteworthy regional news or project updates. Items appear on the home page and in News.
      </p>
      <div className="mt-8">
        <NewsForm />
      </div>
    </div>
  );
}
