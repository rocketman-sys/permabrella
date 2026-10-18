import { and, ilike, or, sql, type SQL } from "drizzle-orm";
import { posts } from "@/lib/db/schema";
import { normalizeSearchQuery, searchPattern } from "./filters";

export function postTextMatch(query: string): SQL | undefined {
  const words = normalizeSearchQuery(query).split(" ").filter(Boolean);
  return and(...words.map((word) => {
    const pattern = searchPattern(word);
    return or(ilike(posts.title, pattern), ilike(posts.description, pattern), ilike(posts.locationDetail, pattern),
      sql`replace(${posts.region}::text, '_', ' ') ilike ${pattern}`)!;
  }));
}

/** A name match should come before a mention buried in a description. */
export function titleRelevance(title: typeof posts.title, query: string) {
  const q = normalizeSearchQuery(query);
  return sql`case when lower(${title}) = lower(${q}) then 0 when ${title} ilike ${searchPattern(q)} then 1 else 2 end`;
}
