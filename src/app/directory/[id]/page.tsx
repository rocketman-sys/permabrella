import Link from "next/link";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/PostDetail";
import { getActivePostById } from "@/lib/posts/service";

export default async function DirectoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getActivePostById(id, "directory_entry");
  if (!item) notFound();

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
