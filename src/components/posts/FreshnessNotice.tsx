import { listingFreshness, type FreshnessPost } from "@/lib/posts/freshness";
import { formatPosted } from "@/lib/posts/format";

export function FreshnessNotice({ post, detail = false }: { post: FreshnessPost; detail?: boolean }) {
  const status = listingFreshness(post);
  const verified = typeof post.metadata.lastVerifiedAt === "string" ? new Date(post.metadata.lastVerifiedAt) : null;
  const colors = status.tone === "green" ? "bg-[#e9efdf] text-[#344e24]" : status.tone === "amber" ? "bg-[#fff0cf] text-[#72510c]" : "bg-[var(--pb-bg)] text-[var(--pb-ink-soft)]";
  return (
    <div className={detail ? "mt-5 rounded-lg border border-[var(--pb-line)] bg-[var(--pb-bg)] p-4" : "mt-3"}>
      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${colors}`}>{status.label}</span>
      {status.note ? <p className="mt-2 text-sm leading-relaxed text-[var(--pb-ink-soft)]">{status.note}</p> : null}
      {detail && verified && !Number.isNaN(verified.getTime()) ? <p className="mt-2 text-xs text-[var(--pb-muted)]">Source checked {formatPosted(verified)}.{post.type === "grant" ? " Funding rounds can change." : ""}</p> : null}
    </div>
  );
}
