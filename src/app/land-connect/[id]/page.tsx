import Link from "next/link";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/PostDetail";
import { getActivePostByIdInTypes } from "@/lib/posts/service";

export default async function LandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getActivePostByIdInTypes(id, [
    "land_available",
    "land_wanted",
  ]);
  if (!item) notFound();

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
