import { PostCard } from "./PostCard";
import type { PostWithAuthor } from "@/lib/posts/service";

export function PostList({
  items,
  basePath,
}: {
  items: PostWithAuthor[];
  basePath:
    | "/events"
    | "/directory"
    | "/grants"
    | "/offerings"
    | "/land-connect";
}) {
  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--perm-border)] bg-[var(--perm-card)] px-4 py-8 text-center text-sm text-[var(--perm-muted)]">
        Nothing here yet. Add a listing or connect an external feed.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {items.map((item) => (
        <li key={item.post.id}>
          <PostCard item={item} href={`${basePath}/${item.post.id}`} />
        </li>
      ))}
    </ul>
  );
}
