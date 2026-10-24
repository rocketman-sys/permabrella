import Link from "next/link";
import type { Region } from "@/lib/regions";

export function directoryPageUrl({ page, query, region }: { page: number; query: string; region?: Region }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (region) params.set("region", region);
  if (page > 1) params.set("page", String(page));
  return `/directory${params.size ? `?${params}` : ""}`;
}

const pageLink = "inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--pb-line)] bg-[var(--pb-surface)] px-3 py-2 text-sm font-semibold text-[var(--pb-accent-2)] hover:bg-[var(--pb-bg)]";

export function DirectoryPagination({ page, pageCount, query, region, position }: {
  page: number;
  pageCount: number;
  query: string;
  region?: Region;
  position: "top" | "bottom";
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => `${directoryPageUrl({ page: target, query, region })}#group-results`;
  return <nav aria-label={`Group pages (${position})`} className="flex flex-wrap items-center justify-between gap-2 py-3">
    {page > 1 ? <Link href={href(page - 1)} rel="prev" className={pageLink}>Previous</Link> : <span aria-disabled="true" className="px-3 py-2 text-sm text-[var(--pb-muted)]">Previous</span>}
    <p className="text-sm">Page <span aria-current="page" className="font-semibold">{page}</span> of {pageCount}</p>
    {page < pageCount ? <Link href={href(page + 1)} rel="next" className={pageLink}>Next</Link> : <span aria-disabled="true" className="px-3 py-2 text-sm text-[var(--pb-muted)]">Next</span>}
  </nav>;
}
