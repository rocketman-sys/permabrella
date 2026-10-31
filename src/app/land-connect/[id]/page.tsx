import Link from "next/link";
import { PostDetail } from "@/components/posts/PostDetail";
import { getPublicListing, listingMetadata } from "@/lib/posts/detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return listingMetadata((await params).id, "land-connect");
}

export default async function LandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPublicListing(id, "land-connect");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-4 text-sm">
        <Link
          href="/land-connect"
          className="text-[var(--perm-secondary)] hover:underline"
        >
          ← Land connect
        </Link>
      </p>
      <PostDetail item={item} backHref="/land-connect" backLabel="Back to land connect" />
    </div>
  );
}
