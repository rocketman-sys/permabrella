import { listingFreshness, type FreshnessPost } from "@/lib/posts/freshness";
import { verificationDetails } from "@/lib/posts/verification";
import { formatPosted } from "@/lib/posts/format";

export function FreshnessNotice({ post, detail = false, compact = false }: { post: FreshnessPost; detail?: boolean; compact?: boolean }) {
  const status = listingFreshness(post);
  const verification = verificationDetails(post.metadata);
  const verified = typeof post.metadata.lastVerifiedAt === "string" ? new Date(post.metadata.lastVerifiedAt) : null;
  const colors = status.tone === "green" ? "bg-[#e9efdf] text-[#344e24]" : status.tone === "amber" ? "bg-[#fff0cf] text-[#72510c]" : "bg-[var(--pb-bg)] text-[var(--pb-ink-soft)]";
  if (compact && !detail) return (
    <div className="mt-3">
      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${colors}`}>{status.label}</span>
      {status.note ? <p className="mt-2 text-sm leading-relaxed text-[var(--pb-ink-soft)]">{status.note}</p> : null}
      {verification.note || post.metadata.communityEdited === true ? <p className="mt-2 text-sm text-[#72510c]">Some details need confirmation. Read the listing notes before making plans.</p> : null}
    </div>
  );
  return (
    <div className={detail ? "mt-5 rounded-lg border border-[var(--pb-line)] bg-[var(--pb-bg)] p-4" : "mt-3"}>
      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${colors}`}>{status.label}</span>
      {status.note ? <p className="mt-2 text-sm leading-relaxed text-[var(--pb-ink-soft)]">{status.note}</p> : null}
      {post.metadata.communityEdited === true ? <div className="mt-2 rounded-md border border-[#e5cd93] bg-[#fff7e4] px-3 py-2 text-sm text-[#624810]"><p className="font-semibold">To be verified · community updated</p><p className="mt-1">These details include community edits that have not been independently verified. Confirm current arrangements directly with the provider.</p>{typeof post.metadata.communityNote==='string' && post.metadata.communityNote ? <p className="mt-1">{post.metadata.communityNote}</p>:null}</div>:null}
      {verification.note ? <div className="mt-2 rounded-md border border-[#e5cd93] bg-[#fff7e4] px-3 py-2 text-sm text-[#624810]">
        <p className="font-semibold">To be verified</p>
        <p className="mt-1">{verification.note}</p>
        {verification.checked ? <p className="mt-1 text-xs">{post.metadata.communityEdited===true?"Research sources checked ":"Checked "}<time dateTime={verification.checked}>{formatPosted(new Date(`${verification.checked}T00:00:00Z`))}</time></p> : null}
      </div> : null}
      {detail && !verification.note && verification.checked ? <p className="mt-2 text-xs text-[var(--pb-muted)]">{post.metadata.communityEdited===true?"Research sources checked ":"Sources checked "}<time dateTime={verification.checked}>{formatPosted(new Date(`${verification.checked}T00:00:00Z`))}</time></p> : null}
      {detail && !verification.checked && verified && !Number.isNaN(verified.getTime()) ? <p className="mt-2 text-xs text-[var(--pb-muted)]">Source checked {formatPosted(verified)}.{post.type === "grant" ? " Funding rounds can change." : ""}</p> : null}
    </div>
  );
}
