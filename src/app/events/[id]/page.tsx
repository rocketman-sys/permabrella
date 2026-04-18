import Link from "next/link";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/PostDetail";
import { getActivePostById } from "@/lib/posts/service";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getActivePostById(id, "event");
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-4 text-sm">
        <Link href="/events" className="text-[var(--perm-secondary)] hover:underline">
          ← All events
        </Link>
      </p>
      <PostDetail item={item} backHref="/events" backLabel="Back to events" />
    </div>
  );
}
