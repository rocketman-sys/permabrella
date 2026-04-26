import Link from "next/link";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/PostDetail";
import { getActivePostById } from "@/lib/posts/service";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getActivePostById(id, "news");
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-4 text-sm">
        <Link href="/news" className="text-[var(--perm-secondary)] hover:underline">
          ← News and updates
        </Link>
      </p>
      <PostDetail item={item} backHref="/news" backLabel="Back to news" />
    </div>
  );
}
