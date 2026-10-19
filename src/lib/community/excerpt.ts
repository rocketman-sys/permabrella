/** Plain text only: React escapes the result; links/HTML are never rendered. */
export function conversationExcerpt(body: string, length = 180): string {
  const text = body.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ').replace(/[`*_>#]/g, '')
    .replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}
