import { and, desc, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { listingVisibility } from '@/lib/posts/visibility';
import { listingFreshness } from '@/lib/posts/freshness';
import { searchPattern } from '@/lib/search/filters';
import { REGIONS } from '@/lib/regions';
import { safeSourceUrl, searchTerms, verificationLabel, type HelperInput, type HelperSource } from './policy';

const types = { all: ['directory_entry', 'event', 'grant', 'land_available', 'land_wanted'], groups: ['directory_entry'], events: ['event'], grants: ['grant'], land: ['land_available', 'land_wanted'] } as const;
const route = { directory_entry: 'directory', event: 'events', grant: 'grants', land_available: 'land-connect', land_wanted: 'land-connect' };

export async function retrievePublicListings(input: HelperInput): Promise<HelperSource[]> {
  const terms = searchTerms(input.query);
  const category = input.category === 'all'
    ? /\bevents?|workshops?\b/i.test(input.query) ? 'events' : /\bgrants?|funding\b/i.test(input.query) ? 'grants' : input.category
    : input.category;
  const rows = await db.select({ id: posts.id, type: posts.type, title: posts.title, description: posts.description,
    region: posts.region, locationDetail: posts.locationDetail, metadata: posts.metadata, externalUrl: posts.externalUrl,
    status: posts.status, createdAt: posts.createdAt, updatedAt: posts.updatedAt, eventDate: posts.eventDate, expiresAt: posts.expiresAt,
  }).from(posts).where(and(listingVisibility('current'), inArray(posts.type, [...types[category]]),
    ...terms.map(word => or(ilike(posts.title, searchPattern(word)), ilike(posts.description, searchPattern(word)), ilike(posts.locationDetail, searchPattern(word)), sql`replace(${posts.region}::text, '_', ' ') ilike ${searchPattern(word)}`)),
  )).orderBy(sql`case when ${posts.title} ilike ${searchPattern(input.query)} then 0 else 1 end`,
    sql`(${sql.join(terms.length ? terms.map(word => sql`case when ${posts.title} ilike ${searchPattern(word)} then 1 else 0 end`) : [sql`0`], sql` + `)}) desc`,
    sql`case when ${posts.type} = 'directory_entry' then 0 else 1 end`,
    sql`case when ${posts.type} = 'event' then ${posts.eventDate} end asc nulls last`, desc(posts.updatedAt)).limit(6);
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
    };
  });
}
