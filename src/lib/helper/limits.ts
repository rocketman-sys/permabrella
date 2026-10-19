// Free preview lookup guard only. Paid generation additionally requires the shared
// PostgreSQL allowance; this map is never treated as a distributed spending cap.
const windows = new Map<string, { start: number; count: number }>();
export function allowPreviewLookup(key: string, now = Date.now()): boolean {
  for (const [k, v] of windows) if (v.start + 60_000 <= now) windows.delete(k);
  let window = windows.get(key);
  if (!window) {
    if (windows.size >= 2_000) return false;
    window = { start: now, count: 0 }; windows.set(key, window);
  }
  return ++window.count <= 12;
}
