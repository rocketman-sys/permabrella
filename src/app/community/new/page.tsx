import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewThreadForm } from "@/components/community/NewThreadForm";
import { listTopicsOrdered } from "@/lib/community/service";

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/community/new");
  }

  const { topic: topicQ } = await searchParams;
  const topicsList = await listTopicsOrdered();

  if (!topicsList.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
          Start a thread
        </h1>
        <p className="mt-4 text-[var(--perm-text-secondary)]">
          Topics are not loaded yet. Run the database seed, then try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
        Start a thread
      </h1>
      <p className="mt-2 text-[var(--perm-text-secondary)]">
        Choose a topic, then ask a clear question or share what you are trying to solve.
        You will get email updates when others reply (you can unsubscribe anytime).
      </p>
      <div className="mt-8">
        <NewThreadForm topicsList={topicsList} defaultTopicSlug={topicQ} />
      </div>
    </div>
  );
}
