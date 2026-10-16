import { FreshnessNotice } from "@/components/posts/FreshnessNotice";
import Link from "next/link";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { Card } from "@/components/ui/Card";
import { GlobalSearchForm } from "@/components/search/GlobalSearchForm";
import { listTopicsOrdered } from "@/lib/community/service";
import { formatPosted } from "@/lib/posts/format";
import { parseRegionParam } from "@/lib/regions";
import { runGlobalSearch } from "@/lib/search/service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search | PermaBrella", robots: { index: false, follow: true } };

function postHref(type: string, id: string): string {
  if (type === "event") return `/events/${id}`;
  if (type === "directory_entry") return `/directory/${id}`;
  if (type === "grant") return `/grants/${id}`;
  if (type === "news") return `/news/${id}`;
  if (type === "land_available" || type === "land_wanted") return `/land-connect/${id}`;
  return `/offerings/${id}`;
}

function postDomainLabel(type: string): string {
  if (type === "event") return "Event";
  if (type === "directory_entry") return "Community group";
  if (type === "grant") return "Grant";
  if (type === "news") return "News";
  if (type === "land_available" || type === "land_wanted") return "Land";
  if (type === "wanted") return "Wanted";
  return "Offering";
}

type SearchParams = {
  q?: string;
  region?: string;
  topic?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const region = parseRegionParam(params.region ?? null);
  const topic = (params.topic ?? "").trim();

  const topics = await listTopicsOrdered();
  const topicOptions = topics.map((t) => ({ slug: t.slug, name: t.name }));

  const { posts, threads } = await runGlobalSearch({
        query,
        region,
        topicSlug: topic || undefined,
      });

  const total = posts.length + threads.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5 md:py-10">
      <PageHeroBar
        title="Search"
        subtitle="Search across events, offerings/wants/exchange, land connect, directory, grants, news, and community threads."
      />

      <div className="mt-5">
        <GlobalSearchForm
          topics={topicOptions}
          initialQuery={query}
          initialRegion={region ?? ""}
          initialTopic={topic}
          compact
        />
      </div>

      <>
          <p className="mt-6 text-sm text-[var(--pb-muted)]">
            {total} result{total === 1 ? "" : "s"}{query ? <> for <span className="font-medium text-[var(--pb-ink)]">{query}</span></> : " across the hub"}
          </p>

          {total === 0 ? <Card className="mt-4">
            <h2 className="text-lg font-semibold">Let’s try a broader search</h2>
            <p className="mt-2 text-sm text-[var(--pb-ink-soft)]">Try fewer words or choose all regions and topics. You can also ask the community for what you need.</p>
            <div className="mt-3 flex flex-wrap gap-4">
              <Link href="/search" className="inline-flex min-h-11 items-center font-semibold text-[var(--pb-accent-2)] underline">Clear search and filters</Link>
              <Link href="/community/new" className="inline-flex min-h-11 items-center font-semibold text-[var(--pb-accent-2)] underline">Ask the community</Link>
            </div>
          </Card> : null}

          <section className="mt-4" aria-labelledby="listing-results">
            <h2 id="listing-results" className="text-lg font-semibold text-[var(--pb-ink)]">
              Switchboard listings ({posts.length})
            </h2>
            {posts.length === 0 ? (
              <Card className="mt-3">
                <p className="text-sm text-[var(--pb-muted)]">No listing matches.</p>
              </Card>
            ) : (
              <ul className="mt-3 space-y-3">
                {posts.map((p) => (
                  <li key={p.id}>
                    <Link href={postHref(p.type, p.id)} className="block">
                      <Card className="transition hover:border-[var(--pb-primary)]/35">
                        <p className="text-xs uppercase tracking-wide text-[var(--pb-muted)]">
                          {postDomainLabel(p.type)}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[var(--pb-ink)]">
                          {p.title}
                        </h3>
                        <FreshnessNotice post={p} />
                        <p className="mt-2 line-clamp-2 text-sm text-[var(--pb-muted)]">
                          {p.description}
                        </p>
                        <p className="mt-2 text-xs text-[var(--pb-muted)]">
                          Listed {formatPosted(p.createdAt)}
                        </p>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8" aria-labelledby="thread-results">
            <h2 id="thread-results" className="text-lg font-semibold text-[var(--pb-ink)]">
              Community threads ({threads.length})
            </h2>
            {threads.length === 0 ? (
              <Card className="mt-3">
                <p className="text-sm text-[var(--pb-muted)]">No thread matches.</p>
              </Card>
            ) : (
              <ul className="mt-3 space-y-3">
                {threads.map((t) => (
                  <li key={t.id}>
                    <Link href={`/community/${t.topicSlug}/${t.id}`} className="block">
                      <Card className="transition hover:border-[var(--pb-primary)]/35">
                        <p className="text-xs uppercase tracking-wide text-[var(--pb-muted)]">
                          Community · {t.topicName}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[var(--pb-ink)]">
                          {t.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-[var(--pb-muted)]">
                          {t.body}
                        </p>
                        <p className="mt-2 text-xs text-[var(--pb-muted)]">
                          {t.authorDisplay ?? "Member"} · Last reply or post {formatPosted(t.lastActivityAt)}
                        </p>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
      </>
    </div>
  );
}
