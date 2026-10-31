import Link from "next/link";
import { PostDetail } from "@/components/posts/PostDetail";
import { getPublicListing, listingMetadata } from "@/lib/posts/detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return listingMetadata((await params).id, "offerings");
}

export default async function OfferingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPublicListing(id, "offerings");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-4 text-sm">
        <Link href="/offerings" className="text-[var(--perm-secondary)] hover:underline">
          ← Exchange
        </Link>
      </p>
      <PostDetail item={item} backHref="/offerings" backLabel="Back to exchange" />
    </div>
  );
}
