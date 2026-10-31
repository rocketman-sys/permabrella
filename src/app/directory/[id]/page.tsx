import Link from "next/link";
import { PostDetail } from "@/components/posts/PostDetail";
import { getPublicListing, listingMetadata } from "@/lib/posts/detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return listingMetadata((await params).id, "directory");
}

export default async function DirectoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getPublicListing(id, "directory");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-4 text-sm">
        <Link href="/directory" className="text-[var(--perm-secondary)] hover:underline">
          ← Directory
        </Link>
      </p>
      <PostDetail item={item} backHref="/directory" backLabel="Back to directory" />
    </div>
  );
}
