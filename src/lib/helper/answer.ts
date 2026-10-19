import { lookupReply, type HelperInput, type HelperReply, type HelperSource } from './policy';
import { modelPayload } from './provider';

type Dependencies = {
  aiEnabled: () => boolean;
  retrieve: (input: HelperInput) => Promise<HelperSource[]>;
  currentUserId: () => Promise<string | null>;
  reserve: (userId: string) => Promise<boolean>;
  generate: (input: HelperInput, sources: HelperSource[]) => Promise<HelperReply>;
};
type Result = { status: number; body: HelperReply | { error: string } };

// Retrieval is independent of AI access. Dependencies keep paid paths testable
// without sessions, database writes, credentials or provider requests.
export async function answerHelper(input: HelperInput, deps: Dependencies): Promise<Result> {
  const sources = input.kind === 'site' ? await deps.retrieve(input) : [];
  const fallback = lookupReply(input, sources);
  const lookup = (notice = fallback.notice): Result => ({ status: 200, body: { ...fallback, notice } });
  const unavailable = (notice: string, error: string, status: number): Result => input.kind === 'site'
    ? lookup(`${notice} ${fallback.notice}`)
    : { status, body: { error } };

  if (!deps.aiEnabled() || (input.kind === 'site' && !sources.length)) return lookup();
  try {
    const userId = await deps.currentUserId();
    if (!userId) return unavailable('Your listing results are ready. Sign in if you would also like an AI summary.', 'Sign in before using the AI evaluation preview.', 401);
    modelPayload(input, sources); // Validate size before reserving budget.
    if (!await deps.reserve(userId)) return unavailable('Your listing results are ready. AI summaries are currently paused or the preview allowance has been reached.', 'The preview allowance is exhausted or paused.', 429);
    try {
      return { status: 200, body: await deps.generate(input, sources) };
    } catch {
      // Keep the reservation: an unsuccessful or timed-out request may be billed.
      return lookup(input.kind === 'site'
        ? `Your listing results are ready. An AI summary is unavailable right now. ${fallback.notice}`
        : 'AI generation was unavailable. No general permaculture guidance was generated.');
    }
  } catch {
    return unavailable('Your listing results are ready. An AI summary is unavailable right now.', 'AI guidance is temporarily unavailable. You can still search local listings.', 503);
  }
}
