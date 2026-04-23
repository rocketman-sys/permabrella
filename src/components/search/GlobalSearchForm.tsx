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
}: {
  topics: TopicOption[];
  initialQuery?: string;
  initialRegion?: Region | "";
  initialTopic?: string;
  compact?: boolean;
}) {
  return (
    <form
      action="/search"
      method="get"
      className="rounded-[var(--pb-r-md)] border border-[var(--pb-line)] bg-[var(--pb-surface)] p-4 shadow-[var(--pb-shadow-card)] sm:p-5"
      role="search"
      aria-label="Search across the switchboard"
    >
      <div className={compact ? "grid gap-3 md:grid-cols-[1.7fr_1fr_1fr_auto]" : "grid gap-3 lg:grid-cols-[1.8fr_1fr_1fr_auto]"}>
        <div>
          <label htmlFor="search-q" className="mb-1 block text-sm font-medium text-[var(--pb-ink)]">
            Find what you&apos;re looking for
          </label>
          <Input
            id="search-q"
            name="q"
            defaultValue={initialQuery}
            placeholder="Search events, directory, grants, offerings/wants/exchange, and community threads..."
            className="min-h-11 border-[var(--pb-line)] bg-white text-[var(--pb-ink)] placeholder:text-[var(--pb-muted)]"
            required
          />
        </div>
        <div>
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
        <div>
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
        </div>
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
