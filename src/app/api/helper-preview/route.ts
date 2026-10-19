import { createHash } from 'node:crypto';
import { auth } from '@/lib/auth';
import { aiConfigured, lookupReply, MAX_BODY_BYTES, parseInput, previewAvailable, sameOrigin } from '@/lib/helper/policy';
import { allowPreviewLookup } from '@/lib/helper/limits';
import { retrievePublicListings } from '@/lib/helper/retrieval';
import { reserveGeneration } from '@/lib/helper/budget';
import { generateAnswer, modelPayload } from '@/lib/helper/provider';

export const runtime = 'nodejs';
export const maxDuration = 30;
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
function fail(error: string, status: number) { return Response.json({ error }, { status, headers }); }

export async function POST(request: Request) {
  if (!previewAvailable()) return fail('Not found.', 404);
  if (!sameOrigin(request)) return fail('Open this preview on its own site.', 403);
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return fail('Use JSON.', 415);
  const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for') ?? 'unknown' : 'local';
  if (!allowPreviewLookup(createHash('sha256').update(ip).digest('hex'))) return fail('Please wait a minute before trying again.', 429);
  let input;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail('Enter a search.', 400);
    const chunks: Uint8Array[] = []; let bytes = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      bytes += value.length;
      if (bytes > MAX_BODY_BYTES) { await reader.cancel(); return fail('Request too large.', 413); }
      chunks.push(value);
    }
    input = parseInput(JSON.parse(Buffer.concat(chunks).toString('utf8')));
  } catch { return fail('Enter a valid question of 2–500 characters.', 400); }
  try {
    const sources = input.kind === 'site' ? await retrievePublicListings(input) : [];
    const fallback = lookupReply(input, sources);
    if (!aiConfigured() || (input.kind === 'site' && !sources.length)) return Response.json(fallback, { headers });
    const session = await auth();
    if (!session?.user?.id) return fail('Sign in before using the AI evaluation preview.', 401);
    modelPayload(input, sources); // Validate size before reserving budget.
    if (!await reserveGeneration(process.env.PB_HELPER_BUDGET_ID!, session.user.id)) return fail('The preview allowance is exhausted or paused.', 429);
    try {
      return Response.json(await generateAnswer(input, sources, process.env.PB_HELPER_GATEWAY_KEY!), { headers });
    } catch {
      return Response.json({ ...fallback, notice: 'AI generation was unavailable. These are listing search results, not an AI answer.' }, { headers });
    }
  } catch { return fail('The helper is temporarily unavailable. Please use the directory or try again later.', 503); }
}
