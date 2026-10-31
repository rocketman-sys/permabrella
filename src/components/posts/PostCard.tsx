import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FreshnessNotice } from "./FreshnessNotice";
import { formatPosted } from "@/lib/posts/format";
import { SharedText } from "@/components/ui/SharedText";
import type { PostWithAuthor } from "@/lib/posts/service";
import { REGIONS } from "@/lib/regions";
import { FOUNDING_PARTNER_LABEL, isFoundingPartner } from "@/lib/posts/featured-groups";

function regionLabel(value: string | null): string | null {
  if (!value) return null;
  const r = REGIONS.find((x) => x.value === value);
  return r?.label ?? value;
}

export function PostCard({
  item,
  href,
  compact = false,
}: {
  item: PostWithAuthor;
  href: string;
  compact?: boolean;
}) {
  const { post, authorDisplay } = item;
  const sourceLabel =
    post.source === "eventbrite"
      ? "Eventbrite"
      : post.source === "humanitix"
        ? "Humanitix"
        : null;

  return (
    <div className="group relative min-w-0 [overflow-wrap:anywhere]">
      <Card className="h-full transition group-hover:border-[var(--perm-secondary)]/40 group-hover:shadow-md">
        {isFoundingPartner(post) ? <p className="mb-2 text-xs font-semibold text-[var(--pb-accent-2)]">Featured group · {FOUNDING_PARTNER_LABEL}</p> : null}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-snug text-[var(--perm-primary)] group-hover:text-[var(--perm-secondary)] md:text-base">
            <Link href={href} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--pb-accent-2)]">{post.title}</Link>
          </h3>
          {regionLabel(post.region) ? (
            <Badge className="shrink-0">{regionLabel(post.region)}</Badge>
          ) : null}
        </div>
        <FreshnessNotice post={post} compact={compact} />
        {post.locationDetail ? (
          <p className={`mt-1 text-base text-[var(--perm-text-secondary)] md:text-sm ${compact ? "line-clamp-2" : ""}`}>
            <SharedText text={post.locationDetail} />
          </p>
        ) : null}
        <p className="mt-3 text-base leading-relaxed text-[var(--perm-text-secondary)] md:text-sm">
          <SharedText text={post.type === "grant" ? post.description.split("\n\n")[0] : post.description} maxLength={compact ? 140 : 220} />
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--perm-muted)] md:text-xs">
          {sourceLabel ? <span>Via {sourceLabel}</span> : null}
          {authorDisplay && !authorDisplay.includes("@") ? <span>Shared by {authorDisplay}</span> : null}
          <span>{post.updatedAt > post.createdAt ? "Updated" : "Listed"} <time dateTime={post.updatedAt.toISOString()}>{formatPosted(post.updatedAt)}</time></span>
        </div>
      </Card>
    </div>
  );
}
