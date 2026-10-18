import Form from "next/form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { REGIONS } from "@/lib/regions";
import { SEARCH_QUERY_LIMIT } from "@/lib/search/filters";
import { SearchSubmit } from "./SearchSubmit";

export function GroupSearchForm({ query, region }: { query: string; region: string }) {
  return <Form action="/directory" role="search" aria-label="Search community groups"
    className="rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-4 sm:p-5">
    <div className="grid items-end gap-3 sm:grid-cols-[2fr_1fr_auto]">
      <div className="min-w-0">
        <label htmlFor="groups-q" className="mb-1 block text-sm font-semibold">Search groups</label>
        <Input id="groups-q" name="q" type="search" defaultValue={query} maxLength={SEARCH_QUERY_LIMIT}
          placeholder="Name, activity or location" aria-describedby="groups-search-help" className="min-h-11" />
      </div>
      <div className="min-w-0">
        <label htmlFor="directory-region" className="mb-1 block text-sm font-medium">Region</label>
        <Select id="directory-region" name="region" defaultValue={region} className="min-h-11">
          <option value="">All regions</option>
          {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
      </div>
      <SearchSubmit label="Search groups" />
    </div>
    <p id="groups-search-help" className="mt-2 text-sm text-[var(--pb-muted)]">Find a group by name, what it does or where it meets. Try “SEED”, “community garden” or “Mullumbimby”.</p>
  </Form>;
}
