export const SEARCH_QUERY_LIMIT = 160;
export type SearchParam = string | string[] | undefined;
export function firstParam(value: SearchParam): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
export function normalizeSearchQuery(value: SearchParam): string {
  return firstParam(value).trim().replace(/\s+/g, " ").slice(0, SEARCH_QUERY_LIMIT);
}
/** Treat SQL wildcard characters as literal text entered by the visitor. */
export function searchPattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}
