import { and, desc, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { listingVisibility } from '@/lib/posts/visibility';
import { listingFreshness } from '@/lib/posts/freshness';
import { searchPattern } from '@/lib/search/filters';
import { REGIONS } from '@/lib/regions';
import { safeSourceUrl, verificationLabel, type HelperInput, type HelperSource } from './policy';
import { listingSearchPlan } from './search';

const types = { all: ['directory_entry', 'event', 'grant', 'land_available', 'land_wanted'], groups: ['directory_entry'], events: ['event'], grants: ['grant'], land: ['land_available', 'land_wanted'] } as const;
const route = { directory_entry: 'directory', event: 'events', grant: 'grants', land_available: 'land-connect', land_wanted: 'land-connect' };

export function publicListingQuery(input: HelperInput, now = new Date()) {
  const { category, groups } = listingSearchPlan(input);
  // Search only public discovery/eligibility metadata, never arbitrary metadata.
  const publicMetadata = sql`concat_ws(' ',${posts.metadata}->>'bestFor',${posts.metadata}->>'eligibilitySummary',${posts.metadata}->>'whoCanApply',${posts.metadata}->>'eligibleRegions')`;
  const titleMatch = (term: string) => ilike(posts.title, searchPattern(term));
  const bodyMatch = (term: string) => or(ilike(posts.description, searchPattern(term)), ilike(posts.locationDetail, searchPattern(term)), sql`replace(${posts.region}::text, '_', ' ') ilike ${searchPattern(term)}`)!;
  const metadataMatch = (term: string) => and(sql`${posts.type} = 'grant'`, sql`${publicMetadata} ilike ${searchPattern(term)}`)!;
  const score = groups.flat().map(term => sql`case when ${titleMatch(term)} then 4 when ${metadataMatch(term)} then 2 when ${bodyMatch(term)} then 1 else 0 end`);
  return db.select({ id: posts.id, type: posts.type, title: posts.title, description: posts.description,
    region: posts.region, locationDetail: posts.locationDetail, metadata: posts.metadata, externalUrl: posts.externalUrl,
    status: posts.status, createdAt: posts.createdAt, updatedAt: posts.updatedAt, eventDate: posts.eventDate, expiresAt: posts.expiresAt,
  }).from(posts).where(and(listingVisibility('current', now), inArray(posts.type, [...types[category]]),
    ...groups.map(variants => or(...variants.map(term => or(titleMatch(term), bodyMatch(term), metadataMatch(term))))),
  )).orderBy(sql`case when ${posts.title} ilike ${searchPattern(input.query)} then 0 else 1 end`,
    // Omit the score for category-only browsing: ORDER BY (0) is a positional
    // reference in PostgreSQL and fails instead of returning the current grants.
    ...(score.length ? [sql`(${sql.join(score, sql` + `)}) desc`] : []),
    sql`case when ${posts.type} = 'grant' then case ${posts.metadata}->>'statusLabel' when 'Open now' then 0 when 'Rolling applications' then 1 when 'Ongoing resource' then 3 else 2 end else 0 end`,
    sql`case when ${posts.type} = 'directory_entry' then 0 else 1 end`,
    sql`case when ${posts.type} = 'event' then ${posts.eventDate} end asc nulls last`, desc(posts.updatedAt)).limit(6);
}

export async function retrievePublicListings(input: HelperInput): Promise<HelperSource[]> {
  const rows = await publicListingQuery(input);
  return rows.map(row => {
    const sourceUrls = [...(Array.isArray(row.metadata.sourceUrls) ? row.metadata.sourceUrls : []), row.externalUrl]
      .map(safeSourceUrl).filter((u): u is string => Boolean(u));
    const fresh = listingFreshness(row);
    return {
      id: row.id, title: row.title, href: `/${route[row.type as keyof typeof route]}/${row.id}`,
      excerpt: row.description.slice(0, 1_000), region: REGIONS.find(r => r.value === row.region)?.label ?? '',
      verification: verificationLabel(row.metadata),
      note: typeof row.metadata.verificationNote === 'string' ? row.metadata.verificationNote.slice(0, 500) : '',
      freshness: `${fresh.label}${fresh.note ? ` · ${fresh.note}` : ''}`, updated: row.updatedAt.toISOString(),
      sourceUrls: [...new Set(sourceUrls)].slice(0, 3),
      ...(row.type === 'grant' ? {
        funding: typeof row.metadata.funding === 'string' ? row.metadata.funding.slice(0, 300) : '',
        eligibility: typeof row.metadata.eligibilitySummary === 'string' ? row.metadata.eligibilitySummary.slice(0, 500) : typeof row.metadata.whoCanApply === 'string' ? row.metadata.whoCanApply.slice(0, 500) : '',
        status: typeof row.metadata.statusLabel === 'string' ? row.metadata.statusLabel.slice(0, 100) : '',
      } : {}),
    };
  });
}
