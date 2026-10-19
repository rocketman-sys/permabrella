export const HELPER_MODEL = 'openai/gpt-6-luna';
export const MAX_BODY_BYTES = 8_192;
export const MAX_QUERY = 500;
export const MAX_OUTPUT_TOKENS = 512;
export const PROVIDER_TIMEOUT_MS = 45_000;
export const CLIENT_TIMEOUT_MS = 65_000;
export const RESERVATION_MICRO_USD = 10_000; // $0.01; no automatic reset/refund.
export type HelperKind = 'site' | 'general';
export type HelperCategory = 'all' | 'groups' | 'events' | 'grants' | 'land';
export type HelperInput = { query: string; kind: HelperKind; category: HelperCategory };
export type HelperSource = {
  id: string; title: string; href: string; excerpt: string; region: string;
  verification: string; note: string; freshness: string; updated: string;
  sourceUrls: string[];
  funding?: string; eligibility?: string; status?: string;
};
export type HelperReply = {
  answer: string; kind: HelperKind; generated: boolean; sources: HelperSource[];
  retrievedAt: string; notice: string;
};

// Public release approved 19 October 2026; AI still requires all trial gates.
export function helperAvailable(env = process.env): boolean {
  return ['preview', 'production'].includes(env.VERCEL_ENV ?? '') || (!env.VERCEL_ENV && env.NODE_ENV === 'development');
}
export function aiConfigured(env = process.env): boolean {
  return helperAvailable(env) && env.PB_HELPER_AI_ENABLED === 'true' &&
    Boolean(env.PB_HELPER_GATEWAY_KEY) && Boolean(env.PB_HELPER_BUDGET_ID) &&
    env.PB_HELPER_PRICING_REVIEW === '2026-10-19' && Date.now() < Date.parse('2026-10-27T00:00:00Z');
}
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const url = new URL(origin);
    // Next dev may use localhost internally even when the browser uses 127.0.0.1.
    // Host is the destination the browser requested; do not trust forwarded hosts.
    return ['http:', 'https:'].includes(url.protocol) && url.origin === origin &&
      url.host === request.headers.get('host');
  } catch { return false; }
}
export function parseInput(value: unknown): HelperInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Enter a question or search.');
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some(k => !['query', 'kind', 'category'].includes(k))) throw Error('Unsupported request fields.');
  if (typeof v.query !== 'string' || v.query.trim().length < 2 || v.query.length > MAX_QUERY) throw Error('Use between 2 and 500 characters.');
  if (v.kind !== 'site' && v.kind !== 'general') throw Error('Choose local listings or general guidance.');
  if (!['all', 'groups', 'events', 'grants', 'land'].includes(String(v.category))) throw Error('Choose a listing category.');
  return { query: v.query.trim(), kind: v.kind, category: v.category as HelperCategory };
}
export function searchTerms(query: string, limit = 6): string[] {
  const stop = new Set('a an the is are i me my we our you your can could would should please find show tell about what which when where who how near nearby around in at on for to of and with do does have has any there local looking want available happening groups group events event grants grant gardens'.split(' '));
  const words = query.toLowerCase().replace(/gardens/g, 'garden').match(/[\p{L}\p{N}]+/gu) ?? [];
  return [...new Set(words.filter(w => w.length > 1 && !stop.has(w)))].slice(0, limit);
}
export function safeSourceUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : null;
  } catch { return null; }
}
export function verificationLabel(metadata: Record<string, unknown>): string {
  const checked = typeof metadata.lastCheckedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(metadata.lastCheckedAt) && Number.isFinite(Date.parse(metadata.lastCheckedAt)) ? metadata.lastCheckedAt : null;
  const edited = typeof metadata.communityEditedAt === 'string' ? Date.parse(metadata.communityEditedAt) : NaN;
  if (checked && edited > Date.parse(checked)) return `Community edited after source check (${checked})`;
  return checked ? `Source check recorded: ${checked}` : 'Community listing · not independently verified';
}

export function lookupReply(input: HelperInput, sources: HelperSource[], now = new Date()): HelperReply {
  const general = input.kind === 'general';
  return {
    kind: input.kind, generated: false, sources: general ? [] : sources, retrievedAt: now.toISOString(),
    answer: general
      ? 'General permaculture AI guidance is currently unavailable. You can explore current PermaBrella listings in the Local listings tab.'
      : sources.length ? `I found ${sources.length} matching public ${sources.length === 1 ? 'listing' : 'listings'}. Read the source cards below and confirm current details with the organiser.`
      : 'I could not find a current public listing matching that search, so I have no local sources for an AI summary. Try a name, town or topic, or choose General permaculture for general advice. This does not mean no local option exists.',
    notice: general ? 'General guidance is distinct from verified local information.' : 'Live listing lookup · no AI-generated answer. A recorded source check is not a guarantee of current availability.',
  };
}

export function parseGenerated(text: string, input: HelperInput, sources: HelperSource[]): HelperReply {
  const v = JSON.parse(text) as { answer?: unknown; sourceIds?: unknown };
  if (typeof v.answer !== 'string' || !v.answer.trim() || v.answer.length > 4_000 || !Array.isArray(v.sourceIds)) throw Error('Invalid model answer.');
  const sourceIds = v.sourceIds;
  const allowed = new Set(sources.map(s => s.id));
  if (sourceIds.some(id => typeof id !== 'string' || !allowed.has(id))) throw Error('Unsupported citation.');
  if (input.kind === 'site' && !sourceIds.length) throw Error('A local answer needs a listing citation.');
  if (input.kind === 'general' && sourceIds.length) throw Error('General guidance cannot claim listing citations.');
  return {
    answer: v.answer, kind: input.kind, generated: true,
    sources: input.kind === 'site' ? sources.filter(s => sourceIds.includes(s.id)) : [],
    retrievedAt: new Date().toISOString(),
    notice: input.kind === 'site' ? 'AI summary of the cited listings. Check the source cards and organiser before acting.' : 'General AI guidance · not locally verified. It does not establish local availability, eligibility or professional advice.',
  };
}
