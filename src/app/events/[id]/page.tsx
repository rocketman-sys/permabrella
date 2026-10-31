import Link from "next/link";
import { PostDetail } from "@/components/posts/PostDetail";
import { getPublicListing, listingMetadata } from "@/lib/posts/detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return listingMetadata((await params).id, "events");
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPublicListing(id, "events");

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
