import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { networkEnquiries } from "@/lib/db/schema";
import { requireEnquiryAdmin } from "@/lib/network/service";
import { networkCard, networkLink } from "@/components/network/NetworkLayout";
import { Button } from "@/components/ui/Button";
import { setEnquiryStatus } from "./actions";

export const dynamic = "force-dynamic";
export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireEnquiryAdmin();
  const params = await searchParams;
  const status = params.status === "reviewed" ? "reviewed" : "new";
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page ?? "1", 10) || 1));
  const rows = await db.select().from(networkEnquiries).where(eq(networkEnquiries.status, status)).orderBy(desc(networkEnquiries.createdAt), desc(networkEnquiries.id)).limit(26).offset((page - 1) * 25);
  return <div className="mx-auto max-w-4xl px-4 py-10"><h1 className="pb-display text-3xl">Network enquiries</h1><p className="mt-3 text-[var(--pb-ink-soft)]">Private membership interest and contact enquiries. Restricted to site administrators.</p>{!process.env.NETWORK_ENQUIRY_EMAIL ? <p className="mt-3 rounded-lg bg-[var(--pb-bg)] p-4 text-sm">Email alerts are not configured. Check this inbox regularly for new submissions.</p> : null}<nav aria-label="Enquiry status" className="my-5 flex gap-6"><Link href="/admin/enquiries" aria-current={status === "new" ? "page" : undefined} className={networkLink}>New</Link><Link href="/admin/enquiries?status=reviewed" aria-current={status === "reviewed" ? "page" : undefined} className={networkLink}>Reviewed</Link></nav>
    <div className="space-y-4">{rows.length ? rows.slice(0, 25).map(row => <article key={row.id} className={`${networkCard} break-words`}><p className="pb-tag text-[var(--pb-accent-2)]">{row.kind === "membership" ? "Membership interest" : "Team enquiry"}</p><h2 className="mt-2 text-xl font-semibold">{row.name}</h2><a href={`mailto:${encodeURIComponent(row.email)}`} className={networkLink}>{row.email}</a><p className="text-sm text-[var(--pb-muted)]">{row.area || "Area not supplied"} · {row.createdAt.toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium", timeStyle: "short" })} NSW time</p>{row.interests.length ? <p className="mt-3">Interests: {row.interests.join(", ")}</p> : null}{row.message ? <p className="mt-3 whitespace-pre-wrap">{row.message}</p> : null}<p className="mt-3 text-xs text-[var(--pb-muted)]">Consent to storage and contact supplied with this submission.</p><form action={setEnquiryStatus} className="mt-4"><input type="hidden" name="id" value={row.id} /><input type="hidden" name="status" value={status === "new" ? "reviewed" : "new"} /><Button type="submit" className="min-h-11">{status === "new" ? "Mark reviewed" : "Move back to new"}</Button></form></article>) : <p className={networkCard}>No {status} enquiries here.</p>}</div>
    <nav aria-label="Enquiry pages" className="mt-5 flex justify-between">{page > 1 ? <Link className={networkLink} href={`/admin/enquiries?status=${status}&page=${page - 1}`}>Previous</Link> : <span />}{rows.length > 25 ? <Link className={networkLink} href={`/admin/enquiries?status=${status}&page=${page + 1}`}>Next</Link> : null}</nav>
  </div>;
}
