import Link from "next/link";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/PostDetail";
import { getActivePostById } from "@/lib/posts/service";

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getActivePostById(id, "grant");
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-4 text-sm">
        <Link href="/grants" className="text-[var(--perm-secondary)] hover:underline">
          ← Grants
        </Link>
      </p>
      <PostDetail item={item} backHref="/grants" backLabel="Back to grants" />
    </div>
  );
}
