# PermaBrella Helper

The public release uses `/helper` and `/api/helper`, with a link in the main and mobile navigation, the home-page introduction and the footer. The reviewed `/helper-preview` URL redirects to `/helper`; its old API URL remains compatible. Public launch was approved on 19 October 2026 after the user tested the preview. AI remains off unless every existing trial configuration gate is present.

## Behaviour and data

- Local mode retrieves up to six current Groups, Events, Grants or Land Connect records using parameterized searches and the existing visibility rules. Removed, expired and past-event records are excluded.
- Results link to the original listing and retain source-check dates, uncertainty notes and availability labels. Search recognises grant/funding intent, removes conversational filler and expands a small set of related regeneration, restoration, conservation and compost terms. Public grant eligibility and discovery fields are searchable; place constraints remain required. This is controlled keyword expansion, not embedding search. A missing result does not establish that no local option exists.
- Grant summaries receive the recorded funding, applicant restrictions and status. They distinguish possible matches, open rounds, rolling applications and directories without promising eligibility or remaining funds. Category-only questions return current results without an invalid PostgreSQL positional sort.
- General permaculture, gardening and food-growing guidance is a separate mode with no local citations. Broader general-purpose Q&A is outside this helper’s scope. With AI off it explicitly explains that generation is unavailable.
- Local lookup is independent of optional AI access: anonymous visitors and signed-in users with paused, expired or exhausted AI allowances still receive listing results with HTTP 200 and a calm explanatory notice. AI authentication, context, budget or provider failures also preserve retrieved results. Invalid requests, lookup rate limits and retrieval failures remain actual search errors. General AI guidance still requires authentication and allowance.
- The tab keeps at most six exchanges in memory and clears on reload. Only the current question is sent to the route. There is no transcript persistence, contact capture, lead delivery or action tool.
- Returned text is rendered as escaped React text. External links come only from retrieved records, accept HTTP(S) without credentials, and use `noopener noreferrer`. Model-provided links are never rendered as links.
- Public descriptions and metadata can contain untrusted community edits. Citation validation proves source membership, **not factual entailment**. A live answer-quality and injection evaluation remains necessary before release.

## Current continuation: 28 October–28 November 2026

Russell explicitly approved continuing the AI chatbot for another month on 28 October 2026 and reviewing it then. The application cutoff, original database allowance expiry and replacement dedicated Gateway key all end at **28 November 2026, 11 am NSW time (00:00 UTC)**. A one-time review is scheduled in this chat (`review-permabrella-ai-helper-trial`). Further extensions and recurring spend still require approval.

The original `permabrella-pr20-2026-10-19` accounting row is retained. Its US$5 lifetime limit and US$0.10 already reserved are not reset or replenished. The continuation therefore starts with US$4.90 available, including deployment checks. The expired key is replaced by a dedicated `permabrella-helper-through-2026-11-28` key with a US$4.90 non-renewing provider budget. Only the production secret is replaced; previews remain without AI configuration.

Fresh model endpoint metadata reviewed on 28 October confirms `openai/gpt-6-luna` via OpenAI still supports zero data retention, no training and structured output at US$0.10/M input and US$0.50/M output tokens for this bounded context. The US$0.01 reservation, 24 KB input cap, 512 output-token cap, sign-in requirement and ten attempts per user per hour remain unchanged. `PB_HELPER_PRICING_REVIEW` is now `2026-10-28`.

Baseline before extension: ten reservations (US$0.10) across one account, including operator testing. The retained per-user row's latest hour was 19 October, 13:00 UTC. Gateway's 14-day history showed nine provider requests, eight HTTP 200 and one HTTP 499 from the earlier timeout investigation; displayed charges totalled less than US$0.01. HTTP 200 does not prove the application accepted an answer, and reservations are not billed cost. The sample does not establish community adoption. Free local search was checked after expiry and returned four regeneration-grant listings without a provider call.

At the November review, compare against this baseline, report actual provider costs separately from reservations, check failures/latency and look for evidence of use beyond operator testing. Do not infer satisfaction from request counts. There is no stored chat transcript or satisfaction feedback. The helper page now states that the trial has ended once the cutoff passes rather than continuing to describe it as active.

## Shared trial configuration

The adapter targets `openai/gpt-6-luna` through Vercel AI Gateway with an OpenAI provider allowlist and per-request zero data retention, reasoning `none`, 512 maximum completion tokens, structured output, no tools, no transcript and one client request without retries. Questions are capped at 500 characters, request bodies at 8 KiB and model payloads at 24 KB. Provider timeout is 45 seconds within a 60-second route allowance, and the browser waits up to 65 seconds; a timeout still consumes the full reservation because a cancelled request may be billed. The original 20-second provider timeout cancelled a regeneration-grants evaluation whose duration was 33.47 seconds. Release review also corrected the old 25-second browser timeout so it cannot interrupt a valid server answer. Server billing logs retain only a generation identifier and token counts, never questions, answers or credentials.

The process-local 12/minute lookup limiter is a best-effort abuse guard; it is not a distributed spend cap. Generation additionally requires an authenticated account and an atomic database reservation with ten attempts per user per hour. It reserves US$0.01 per request permanently, without automatic refunds, refills or resets. Missing tables or exhausted, paused or expired allowances fail closed.

The original trial was a separate, one-time US$5 PermaBrella evaluation allowance approved on 19 October 2026 (the authorized continuation is documented above). `helper-preview-budget.sql` is applied only through an explicit operator command, never at application startup. The allowance `permabrella-pr20-2026-10-19` has no refill or reset and originally expired at 00:00 UTC on 27 October 2026. The original dedicated Gateway key was used only for this project, had that same expiry, and had a separate US$5 non-renewing provider budget. The original production launch used that same dedicated PermaBrella key, budget ID, accounting row and expiry. With explicit user approval, the four existing helper settings moved from branch-specific Preview to Production-only on 19 October 2026, preserving their values. Vercel does not allow a branch-specific Preview setting to also target Production. Future preview deployments therefore have no AI configuration; previously deployed previews can retain their captured settings and share the same remaining allowance. At that launch, no new key, allowance or broad preview access was created. Roshni credentials and allowances are unrelated and unchanged.

The reservation is conservative against the 19 October 2026 catalog price of $0.10/M input and $0.50/M output tokens, but does not cap existing hosting/database charges. Per-request provider filtering and zero data retention have no additional charge. A database concurrency check admitted exactly two of twenty simultaneous US$0.01 reservations against a separate US$0.025 test row; the row was then disabled. No model calls or user-record changes were involved in that check. Actual billed usage must be checked in Gateway logs; the app deliberately deducts the full conservative reservation rather than refunding its unused portion.

## Activation and rollback

1. Confirm authorization for provider/data handling and a separate bounded evaluation allowance. Public launch and the one-month continuation through 28 November 2026 are approved; recurring spend, automatic replenishment and further extensions are not approved.
2. Use the dedicated expiring project key. Never reuse Roshni credentials or silently enable Vercel OIDC.
3. Review/apply the schema in the approved evaluation environment and insert one disabled, expiring budget. Do not insert test users into production or use production content writes for tests.
4. Production uses the existing `PB_HELPER_GATEWAY_KEY`, `PB_HELPER_BUDGET_ID`, `PB_HELPER_PRICING_REVIEW=2026-10-28` and `PB_HELPER_AI_ENABLED=true` settings, now targeted only to Production. Do not create, reset, refill or re-enable the accounting row: use its current state. The pricing gate expires on 28 November 2026; updating it again requires approval and a fresh review. Do not restore Preview access without reviewing the intended scope.
5. Run paid retrieval/answer/injection/accessibility checks and inspect actual provider routing, usage and billing. The release code enables public search; AI still requires sign-in, current configuration and a successful atomic reservation. Verify the actual production deployment before declaring launch complete.

To stop AI, set `PB_HELPER_AI_ENABLED=false` in the affected environment or disable the shared budget; preserve all accounting records. Local lookup remains available. A request already in flight may still finish or be billed. Reverting the release commit removes the public entry point. Never reset reservations as part of rollback.

## Validation

```sh
node --import tsx --test src/lib/helper/helper.test.ts
node --import tsx --test src/lib/helper/answer.test.ts
node --import tsx --test src/lib/helper/search.test.ts
node --import tsx --test src/lib/helper/retrieval.test.ts
node --import tsx --test src/lib/helper/budget.test.ts
npx eslint src/lib/helper src/components/helper src/app/helper src/app/api/helper src/app/helper-preview src/app/api/helper-preview
npx tsc --noEmit
npm run build
```

Budget tests require existing `DATABASE_URL`; they use transaction-scoped temporary tables and never apply the operator schema. They test exhausted/shared, per-user, paused and expired allowances. The separate `scripts/prepare-helper-budget.ts --verify` operator check exercises concurrent database connections without model calls and leaves a disabled verification record. Browser verification covers real public lookups, direct listing links, empty results, general-mode separation, keyboard focus, mobile overflow, the public navigation, old-link redirects and production access gates.

References: [Gateway Chat Completions](https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions), [provider routing](https://vercel.com/docs/ai-gateway/models-and-providers/provider-filtering-and-ordering), [live model endpoint metadata](https://ai-gateway.vercel.sh/v1/models/openai/gpt-6-luna/endpoints).

Retrieval regressions also use transaction-scoped temporary tables, including the reported query `what grants are available for local regen`, metadata-only matches, town constraints, unknown terms, category-only browsing and closed/expired/removed records. They never write live listings. `scripts/evaluate-helper-regen-once.ts` is an explicit operator-only answer check for this query. Its initial evaluation can claim one US$0.01 reservation from the reviewed US$0.04 accounting state. After the timed-out request was inspected in Gateway Logs, a separately selected timeout-fix evaluation can claim once from US$0.05. Neither can replay after its claim, including after failure. The script is not part of normal builds or application routes.
