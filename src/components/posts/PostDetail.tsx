import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatEventWhen, formatPosted } from "@/lib/posts/format";
import type { PostWithAuthor } from "@/lib/posts/service";
import { REGIONS } from "@/lib/regions";

function regionLabel(value: string | null): string | null {
  if (!value) return null;
  const r = REGIONS.find((x) => x.value === value);
  return r?.label ?? value;
}

function telHref(phone: string): string {
  return `tel:${phone.trim().replace(/\s/g, "")}`;
}

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95";

const btnGhost =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--perm-primary)] transition hover:bg-black/[0.04]";

export function PostDetail({
  item,
  backHref,
  backLabel,
}: {
  item: PostWithAuthor;
  backHref: string;
  backLabel: string;
}) {
  const { post, authorDisplay } = item;
  const when =
    post.type === "event" ? formatEventWhen(post.eventDate) : null;
  const sourceLabel =
    post.source === "eventbrite"
      ? "Eventbrite"
      : post.source === "humanitix"
        ? "Humanitix"
        : post.source === "direct"
          ? "PermaBrella"
          : post.source;

  return (
    <article className="rounded-2xl border border-[var(--perm-border)] bg-[var(--perm-card)] px-6 py-8 shadow-sm sm:px-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--perm-primary)] sm:text-3xl">
          {post.title}
        </h1>
        {regionLabel(post.region) ? (
          <Badge>{regionLabel(post.region)}</Badge>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-[var(--perm-muted)]">
        Source: {sourceLabel}
        {authorDisplay ? ` · Shared by ${authorDisplay}` : null}
        {" · Listed "}
        {formatPosted(post.createdAt)}
      </p>

      {when ? (
        <p className="mt-4 text-lg font-medium text-[var(--perm-secondary)]">
          {when}
        </p>
      ) : null}

      {post.locationDetail ? (
        <p className="mt-2 text-[var(--perm-text-secondary)]">
          {post.locationDetail}
        </p>
      ) : null}

      <div className="mt-6 max-w-none whitespace-pre-wrap text-base leading-relaxed text-[var(--perm-text)]">
        {post.description}
      </div>

      {post.contactPhone || post.contactEmail || post.contactMethod ? (
        <section className="mt-8 rounded-xl bg-[var(--perm-bg)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--perm-primary)]">
            Contact
          </h2>
          <dl className="mt-2 space-y-2 text-sm text-[var(--perm-text-secondary)]">
            {post.contactPhone ? (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="shrink-0 font-medium text-[var(--perm-text)]">Phone</dt>
                <dd>
                  <a
                    href={telHref(post.contactPhone)}
                    className="text-[var(--perm-secondary)] hover:underline"
                  >
                    {post.contactPhone}
                  </a>
                </dd>
              </div>
            ) : null}
            {post.contactEmail ? (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="shrink-0 font-medium text-[var(--perm-text)]">Email</dt>
                <dd>
                  <a
                    href={`mailto:${post.contactEmail.trim()}`}
                    className="break-all text-[var(--perm-secondary)] hover:underline"
                  >
                    {post.contactEmail}
                  </a>
                </dd>
              </div>
            ) : null}
            {post.contactMethod ? (
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="shrink-0 font-medium text-[var(--perm-text)]">Other</dt>
                <dd className="whitespace-pre-wrap">{post.contactMethod}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {post.externalUrl ? (
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnPrimary}
          >
            Open external link
          </a>
        ) : null}
        <Link href={backHref} className={btnGhost}>
          {backLabel}
        </Link>
      </div>
    </article>
  );
}
