import { SharedText } from "@/components/ui/SharedText";
import Link from "next/link";
import { canEditListing, safePublicUrl } from "@/lib/listing-edits/policy";
import { Badge } from "@/components/ui/Badge";
import { FreshnessNotice } from "./FreshnessNotice";
import { AddToCalendar } from "./AddToCalendar";
import { formatPosted } from "@/lib/posts/format";
import type { PostWithAuthor } from "@/lib/posts/service";
import { publicSourceUrls } from "@/lib/posts/verification";
import { REGIONS } from "@/lib/regions";
import { FOUNDING_PARTNER_LABEL, isFoundingPartner } from "@/lib/posts/featured-groups";

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
  const sources = publicSourceUrls(post.metadata);
  // Imported status text ages independently of the live deadline/status notice.
  const description = post.type === "grant"
    ? post.description.split("\n\n").filter((part) => !/^(Status|Funding|Who can apply):/i.test(part.trim())).join("\n\n")
    : post.description;
  const sourceLabel =
    post.source === "eventbrite"
      ? "Eventbrite"
      : post.source === "humanitix"
        ? "Humanitix"
        : post.source === "direct"
          ? "PermaBrella"
          : post.source;

  return (
    <article className="min-w-0 [overflow-wrap:anywhere] rounded-2xl border border-[var(--perm-border)] bg-[var(--perm-card)] px-6 py-8 shadow-sm sm:px-10">
      {isFoundingPartner(post) ? <p className="mb-3 text-sm font-semibold text-[var(--pb-accent-2)]">Featured group · {FOUNDING_PARTNER_LABEL}</p> : null}
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
        {authorDisplay && !authorDisplay.includes("@") ? ` · Shared by ${authorDisplay}` : null}
        {" · Listed "}
        {formatPosted(post.createdAt)}{post.updatedAt > post.createdAt ? ` · Updated ${formatPosted(post.updatedAt)}` : ""}
      </p>

      {canEditListing(post.type,post.status) ? <section className="mt-5 rounded-lg border border-[var(--pb-line)] p-4 text-sm" aria-label="Community editing">
        <p>Help keep this listing useful. Anyone signed in can update its public details. Every edit shows who changed it and is kept in the edit history.</p>
        {typeof post.metadata.communityEditedBy === 'string' && typeof post.metadata.communityEditedAt === 'string' && !Number.isNaN(Date.parse(post.metadata.communityEditedAt)) ? <p className="mt-2 font-semibold">Last edited by {post.metadata.communityEditedBy.includes('@')?'Community member':post.metadata.communityEditedBy} · <time dateTime={post.metadata.communityEditedAt}>{new Date(post.metadata.communityEditedAt).toLocaleString('en-AU',{timeZone:'Australia/Sydney',dateStyle:'medium',timeStyle:'short'})} NSW time</time></p> : null}
        <div className="mt-2 flex flex-wrap gap-x-5"><Link href={`/listings/${post.id}/edit`} className="inline-flex min-h-11 items-center font-semibold underline">Edit this listing</Link><Link href={`/listings/${post.id}/history`} className="inline-flex min-h-11 items-center underline">View edit history</Link><Link href="/how-it-works#community-editing" className="inline-flex min-h-11 items-center underline">How community editing works</Link></div>
      </section> : null}
      <FreshnessNotice post={post} detail />
      {post.type === "grant" ? <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {[["Funding", post.metadata.funding], ["Who can apply", post.metadata.whoCanApply]].map(([label, value]) => typeof value === "string" && value ? <div key={label as string}><dt className="text-xs font-semibold uppercase text-[var(--pb-muted)]">{label as string}</dt><dd className="mt-1 text-sm"><SharedText text={value} /></dd></div> : null)}
      </dl> : null}
      {post.locationDetail ? (
        <p className="mt-2 text-[var(--perm-text-secondary)]">
          <SharedText text={post.locationDetail} />
        </p>
      ) : null}

      <AddToCalendar post={post} />

      <div className="mt-6 max-w-none whitespace-pre-wrap text-base leading-relaxed text-[var(--perm-text)]">
        <SharedText text={description} />
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
                <dd className="whitespace-pre-wrap"><SharedText text={post.contactMethod} /></dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {typeof post.metadata.parentDirectoryId === "string" && /^[a-f0-9-]{36}$/.test(post.metadata.parentDirectoryId) ? <p className="mt-5 text-sm"><Link href={`/directory/${post.metadata.parentDirectoryId}`} className="font-semibold text-[var(--pb-accent-2)] underline">{typeof post.metadata.parentDirectoryName === "string" ? post.metadata.parentDirectoryName : "Related community organisation"}</Link></p> : null}
      {sources.length ? <section className="mt-6" aria-label="Public sources"><h2 className="text-sm font-semibold">Public sources</h2><ul className="mt-2 space-y-2 text-sm">{sources.map((url, index) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center break-all text-[var(--pb-accent-2)] underline">{new URL(url).hostname} · source {index + 1}<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul></section> : null}
      {Array.isArray(post.metadata.communitySources) && post.metadata.communitySources.some(u=>typeof u==='string'&&safePublicUrl(u)) ? <section className="mt-6"><h2 className="text-sm font-semibold">Community-provided sources</h2><ul className="mt-2 space-y-2 text-sm">{post.metadata.communitySources.filter((u):u is string=>typeof u==='string'&&safePublicUrl(u)).map(url=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center break-all underline">{url}<span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul></section>:null}
      <div className="mt-8 flex flex-wrap gap-3">
        {post.externalUrl ? (
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btnPrimary}
          >
            {post.type === "grant" ? "Check funding with the provider" : post.type === "event" ? "Event details & booking" : "Visit website"}
          </a>
        ) : null}
        <Link href={backHref} className={btnGhost}>
          {backLabel}
        </Link>
      </div>
    </article>
  );
}
