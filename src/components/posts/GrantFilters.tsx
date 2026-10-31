import Link from "next/link";
import { REGIONS, type Region } from "@/lib/regions";
import { APPLICANT_OPTIONS, FUNDING_OPTIONS, type ApplicantFilter, type FundingFilter } from "@/lib/posts/grant-filters";

export function GrantFilters({ region, applicant, funding, filtered }: {
  region?: Region; applicant: ApplicantFilter; funding: FundingFilter; filtered: boolean;
}) {
  const fields = [
    { name: "region", label: "Region", value: region ?? "", options: [{ value: "", label: "All regions" }, ...REGIONS] },
    { name: "applicant", label: "Who can apply", value: applicant, options: APPLICANT_OPTIONS },
    { name: "funding", label: "Funding status", value: funding, options: FUNDING_OPTIONS },
  ];
  return <form key={`${region ?? ""}/${applicant}/${funding}`} action="/grants#grant-results" className="mt-6 rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-4 sm:p-5" aria-label="Filter grants">
    <div className="grid gap-3 sm:grid-cols-3">
      {fields.map((field) => <div key={field.name} className="min-w-0">
        <label htmlFor={`grants-${field.name}`} className="block text-sm font-semibold">{field.label}</label>
        <select id={`grants-${field.name}`} name={field.name} defaultValue={field.value} className="mt-1 min-h-11 w-full rounded-lg border border-[var(--pb-line)] bg-[var(--pb-bg)] px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pb-primary)]">
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>)}
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--pb-primary)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90">Apply filters</button>
      {filtered ? <Link href="/grants#grant-results" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--pb-accent-2)] underline underline-offset-4">Clear filters</Link> : null}
    </div>
    <p className="mt-2 text-xs leading-relaxed text-[var(--pb-ink-soft)]">Applicant groups are a starting point. Check each provider’s full eligibility requirements, including any need for an auspice.</p>
  </form>;
}
