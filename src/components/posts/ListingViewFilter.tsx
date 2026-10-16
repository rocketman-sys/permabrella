import Link from "next/link";
import type { Region } from "@/lib/regions";

export function ListingViewFilter({ basePath, view, region }: { basePath: string; view: "current" | "past"; region?: Region }) {
  return <nav aria-label="Listing availability" className="mt-5 flex flex-wrap gap-2">{(["current", "past"] as const).map((value) => {
    const query = new URLSearchParams();
    if (region) query.set("region", region);
    if (value === "past") query.set("view", value);
    return <Link key={value} href={`${basePath}${query.size ? `?${query}` : ""}`} aria-current={view === value ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm ${view === value ? "border-[var(--pb-accent-2)] bg-[var(--pb-accent-2)] font-semibold text-white" : "border-[var(--pb-line)] bg-[var(--pb-surface)]"}`}>{value === "current" ? "Current & undated" : "Past & closed"}</Link>;
  })}</nav>;
}
