const zone = "Australia/Sydney";
const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

function parts(date: Date) {
  return Object.fromEntries(partsFormatter.formatToParts(date).map((p) => [p.type, p.value]));
}

/** Interpret a datetime-local field in the community's timezone, not the server's. */
export function parseSydneyDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, min, sec = "00"] = match;
  const wallTime = Date.UTC(+y, +m - 1, +d, +h, +min, +sec);
  let candidate = wallTime;
  for (let i = 0; i < 3; i++) {
    const p = parts(new Date(candidate));
    const rendered = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    candidate += wallTime - rendered;
  }
  const result = new Date(candidate);
  const p = parts(result);
  return p.year === y && p.month === m && p.day === d && p.hour === h && p.minute === min && p.second === sec ? result : null;
}

export function sydneyDayStart(now: Date): Date {
  const p = parts(now);
  return parseSydneyDateTime(`${p.year}-${p.month}-${p.day}T00:00`)!;
}
