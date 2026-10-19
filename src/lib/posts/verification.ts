export function verificationDetails(metadata: Record<string, unknown>) {
  const note = typeof metadata.verificationNote === 'string' ? metadata.verificationNote.trim() : '';
  const checked = typeof metadata.lastCheckedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(metadata.lastCheckedAt) ? metadata.lastCheckedAt : null;
  return { note, checked };
}
export function publicSourceUrls(metadata: Record<string, unknown>): string[] {
  return Array.isArray(metadata.sourceUrls) ? [...new Set(metadata.sourceUrls.filter((value): value is string => {
    if (typeof value !== 'string') return false;
    try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
  }))] : [];
}
