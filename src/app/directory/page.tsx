import type { Metadata } from "next";
import Link from "next/link";
import { PostList } from "@/components/posts/PostList";
import { PageHeroBar } from "@/components/layout/PageHeroBar";
import { GroupSearchForm } from "@/components/search/GroupSearchForm";
import { DirectoryPagination, directoryPageUrl } from "@/components/search/DirectoryPagination";
import { DIRECTORY_PAGE_SIZE, listDirectoryPage, type PostWithAuthor } from "@/lib/posts/service";
import { parseRegionParam } from "@/lib/regions";
import { firstParam, normalizeSearchQuery, type SearchParam } from "@/lib/search/filters";

export const metadata: Metadata = { title: "Community groups | PermaBrella" };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: SearchParam; q?: SearchParam; page?: SearchParam }>;
}) {
  const { region: regionQ, q, page: pageQ } = await searchParams;
  const region = parseRegionParam(firstParam(regionQ));
  const query = normalizeSearchQuery(q);
  const pageParam = firstParam(pageQ);
  const parsedPage = /^\d+$/.test(pageParam) ? Number(pageParam) : 1;
  const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  let items: PostWithAuthor[] = [];
  let total = 0;
  let page = requestedPage;
  let pageCount = 1;
  let loadFailed = false;
  try {
    ({ items, total, page, pageCount } = await listDirectoryPage({ region, query, page: requestedPage }));
  } catch {
    console.error("[directory] Unable to load community groups.");
    loadFailed = true;
  }
  const searchUrl = directoryPageUrl({ page, query, region });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <PageHeroBar
        title="Community groups"
        iconSrc="/brand/icon-groups.svg"
        subtitle="Organisations, food hubs, and collectives across the Northern Rivers."
        actions={
          <Link
            href="/directory/new"
            className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Add a group
          </Link>
        }
      />

      <div className="mt-6">
        <GroupSearchForm key={`${query}:${region ?? ""}`} query={query} region={region ?? ""} />
        <div id="group-results" className="mt-3 scroll-mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm">
          {!loadFailed ? <p role="status">{total ? `Showing ${(page - 1) * DIRECTORY_PAGE_SIZE + 1}–${(page - 1) * DIRECTORY_PAGE_SIZE + items.length} of ${total}` : "0"} group{total === 1 ? "" : "s"}{query ? <> matching <strong>“{query}”</strong></> : ""}</p> : null}
          <div className="flex flex-wrap gap-5">
            {query || region ? <Link href="/directory" className="inline-flex min-h-11 items-center text-[var(--pb-accent-2)] underline">Clear search and filters</Link> : null}
            <Link href={`/search?${new URLSearchParams({ q: query, ...(region ? { region } : {}) })}`} className="inline-flex min-h-11 items-center text-[var(--pb-accent-2)] underline">Search the whole site</Link>
          </div>
        </div>
        {!loadFailed ? <DirectoryPagination page={page} pageCount={pageCount} query={query} region={region} position="top" /> : null}
      </div>

      <div className="mt-4">
        {loadFailed ? <div role="alert" className="rounded-xl border border-[var(--pb-line)] bg-[var(--pb-surface)] p-6">
          <h2 className="text-xl font-semibold">Groups couldn’t be loaded</h2>
          <p className="mt-2">Please try again in a moment. Your search and region are still selected.</p>
          <a href={searchUrl} className="mt-3 inline-flex min-h-11 items-center text-[var(--pb-accent-2)] underline">Try again</a>
        </div> : query && !items.length ? <div className="rounded-xl border border-dashed border-[var(--pb-line)] bg-[var(--pb-surface)] p-6">
          <h2 className="text-xl font-semibold">No groups match “{query}”</h2>
          <p className="mt-2">Try fewer words, a nearby town or all regions.</p>
          {region ? <Link href={`/directory?${new URLSearchParams({ q: query })}`} className="mt-3 inline-flex min-h-11 items-center text-[var(--pb-accent-2)] underline">Search these words in all regions</Link> : null}
        </div> : <PostList items={items} basePath="/directory" region={region} />}
      </div>
      {!loadFailed ? <DirectoryPagination page={page} pageCount={pageCount} query={query} region={region} position="bottom" /> : null}
    </div>
  );
}
