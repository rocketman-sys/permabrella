import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatEventWhen, formatPosted } from "@/lib/posts/format";
import { truncate } from "@/lib/posts/text";
import type { PostWithAuthor } from "@/lib/posts/service";
import { REGIONS } from "@/lib/regions";

function regionLabel(value: string | null): string | null {
  if (!value) return null;
  const r = REGIONS.find((x) => x.value === value);
  return r?.label ?? value;
}

export function PostCard({
  item,
  href,
}: {
  item: PostWithAuthor;
  href: string;
}) {
  const { post, authorDisplay } = item;
  const when =
    post.type === "event" ? formatEventWhen(post.eventDate) : null;
  const closes =
    post.type === "grant" && post.expiresAt
      ? formatPosted(post.expiresAt)
      : null;
  const sourceLabel =
    post.source === "eventbrite"
      ? "Eventbrite"
      : post.source === "humanitix"
        ? "Humanitix"
        : null;

  return (
    <Link href={href} className="group block">
      <Card className="h-full transition group-hover:border-[var(--perm-secondary)]/40 group-hover:shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-lg font-semibold leading-snug text-[var(--perm-primary)] group-hover:text-[var(--perm-secondary)] md:text-base">
            {post.title}
          </h2>
          {regionLabel(post.region) ? (
            <Badge className="shrink-0">{regionLabel(post.region)}</Badge>
          ) : null}
        </div>
        {when ? (
          <p className="mt-2 text-base font-medium text-[var(--perm-secondary)] md:text-sm">
            {when}
          </p>
        ) : null}
        {closes ? (
          <p className="mt-2 text-base font-medium text-[var(--perm-secondary)] md:text-sm">
            Closes {closes}
          </p>
        ) : null}
        {post.locationDetail ? (
          <p className="mt-1 text-base text-[var(--perm-text-secondary)] md:text-sm">
            {post.locationDetail}
          </p>
        ) : null}
        <p className="mt-3 text-base leading-relaxed text-[var(--perm-text-secondary)] md:text-sm">
          {truncate(post.description, 220)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--perm-muted)] md:text-xs">
          {sourceLabel ? <span>Via {sourceLabel}</span> : null}
          {authorDisplay ? <span>Posted by {authorDisplay}</span> : null}
          <span>Listed {formatPosted(post.createdAt)}</span>
        </div>
      </Card>
    </Link>
  );
}
