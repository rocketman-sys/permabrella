import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { REGIONS, type Region } from "@/lib/regions";

type TopicOption = { slug: string; name: string };

export function GlobalSearchForm({
  topics,
  initialQuery = "",
  initialRegion = "",
  initialTopic = "",
  compact = false,
  home = false,
}: {
  topics: TopicOption[];
  initialQuery?: string;
  initialRegion?: Region | "";
  initialTopic?: string;
  compact?: boolean;
  home?: boolean;
}) {
  return (
    <form
      action="/search"
      method="get"
      className={home ? "" : "rounded-lg border border-[var(--pb-line)] bg-[var(--pb-surface)] p-4 sm:p-5"}
      role="search"
      aria-label="Search across the switchboard"
    >
      <div className={home ? "grid grid-cols-[1fr_auto] gap-3 md:grid-cols-[2fr_1fr_auto]" : compact ? "grid gap-3 md:grid-cols-[1.7fr_1fr_1fr_auto]" : "grid gap-3 lg:grid-cols-[1.8fr_1fr_1fr_auto]"}>
        <div className={home ? "col-span-2 min-w-0 md:col-span-1" : "min-w-0"}>
          <label htmlFor="search-q" className="mb-1 block text-sm font-medium text-[var(--pb-ink)]">
            What are you looking for?
          </label>
          <Input
            id="search-q"
            name="q"
            defaultValue={initialQuery}
            placeholder="Try seeds, compost or a local group"
            className="min-h-11 border-[var(--pb-line)] bg-white text-[var(--pb-ink)] placeholder:text-[var(--pb-muted)]"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="search-region" className="mb-1 block text-sm font-medium text-[var(--pb-ink)]">
            Region
          </label>
          <Select
            id="search-region"
            name="region"
            defaultValue={initialRegion}
            className="border-[var(--pb-line)] text-[var(--pb-ink)]"
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>
        {!home ? <div>
          <label htmlFor="search-topic" className="mb-1 block text-sm font-medium text-[var(--pb-ink)]">
            Topic group
          </label>
          <Select
            id="search-topic"
            name="topic"
            defaultValue={initialTopic}
            className="border-[var(--pb-line)] text-[var(--pb-ink)]"
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </Select>
        </div> : null}
        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--pb-primary-dk)]"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
