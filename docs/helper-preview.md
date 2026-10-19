# PermaBrella helper review preview

This branch adds `/helper-preview` and `/api/helper-preview` for local development and Vercel previews. Both return 404 in production. No global navigation or widget has been added. The review UI performs live public listing searches; **AI generation is off by default**. This is a draft for review, not a public activation or a recurring spending commitment.

## Behaviour and data

- Local mode retrieves up to six current Groups, Events, Grants or Land Connect records using parameterized searches and the existing visibility rules. Removed, expired and past-event records are excluded.
- Results link to the original listing and retain source-check dates, uncertainty notes and availability labels. Matching is keyword-based, not semantic search. A missing result does not establish that no local option exists.
- General permaculture guidance is a separate mode with no local citations. With AI off it explicitly explains that generation is unavailable.
- The tab keeps at most six exchanges in memory and clears on reload. Only the current question is sent to the route. There is no transcript persistence, contact capture, lead delivery or action tool.
- Returned text is rendered as escaped React text. External links come only from retrieved records, accept HTTP(S) without credentials, and use `noopener noreferrer`. Model-provided links are never rendered as links.
- Public descriptions and metadata can contain untrusted community edits. Citation validation proves source membership, **not factual entailment**. A live answer-quality and injection evaluation remains necessary before activation.

## Inactive generation preparation

The adapter targets `openai/gpt-6-luna` through Vercel AI Gateway with an OpenAI provider allowlist, reasoning `none`, 512 maximum completion tokens, structured output, no tools, no transcript and one client request without retries. Questions are capped at 500 characters, request bodies at 8 KiB and model payloads at 24 KB. Provider timeout is 20 seconds; a timeout still consumes the full reservation because a cancelled request may be billed.

The process-local 12/minute lookup limiter is a best-effort abuse guard; it is not a distributed spend cap. Generation additionally requires an authenticated account and an atomic database reservation with ten attempts per user per hour. It reserves US$0.01 per request permanently, without automatic refunds, refills or resets. Missing tables or exhausted, paused or expired allowances fail closed.

`helper-preview-budget.sql` is a **review-only schema**, not an automatically applied migration. No tables, allowance, new credentials, provider account or environment configuration have been created. The schema permits an explicitly approved one-time allowance of at most US$5; that is a maximum supported value, **not approval to spend it**. The Roshni comparison allowance does not apply to PermaBrella.

The reservation is conservative against the 19 October 2026 catalog price of $0.10/M input and $0.50/M output tokens, but does not cap existing hosting/database charges or unverified mandatory charges. Before any paid test, recheck live model support, token overhead, gateway routing, team billing and mandatory charges. Verify concurrency and provider behaviour under an approved test allowance. This preparation has no measured model accuracy, latency or actual billed-cost results.

## Activation requires a separate decision

1. Approve the review, the exact provider/data handling and a separate bounded PermaBrella evaluation allowance including mandatory charges. Public launch and recurring spend are separate decisions.
2. Confirm secure access. Creating or materially expanding credentials requires action-time confirmation. Never reuse Roshni credentials or silently enable Vercel OIDC.
3. Review/apply the schema in the approved evaluation environment and insert one disabled, expiring budget. Do not insert test users into production or use production content writes for tests.
4. After access and billing verification, set preview-only `PB_HELPER_GATEWAY_KEY`, `PB_HELPER_BUDGET_ID`, `PB_HELPER_PRICING_REVIEW=2026-10-19` and `PB_HELPER_AI_ENABLED=true`, and explicitly enable the agreed budget. The pricing gate expires on 27 October 2026; updating it requires a fresh review.
5. Run paid retrieval/answer/injection/accessibility checks and inspect actual provider routing, usage and billing. Setting a key alone can never enable these routes in production. Public release requires a reviewed code change.

Rollback of this review is simply to close the draft PR/remove its preview. For a later approved evaluation, set `PB_HELPER_AI_ENABLED=false` and disable its budget to stop new reservations; preserve accounting records. A request already in flight may still finish or be billed.

## Validation

```sh
node --import tsx --test src/lib/helper/helper.test.ts
node --import tsx --test src/lib/helper/budget.test.ts
npx eslint src/lib/helper src/components/helper src/app/helper-preview src/app/api/helper-preview
npx tsc --noEmit
npm run build
```

Budget tests require existing `DATABASE_URL`; they use transaction-scoped temporary tables and never apply the review schema. They test exhausted/shared, per-user, paused and expired allowances; they do not simulate concurrent connections. Browser verification covers real public lookups, direct listing links, empty results, general-mode separation, keyboard focus, mobile overflow and production blocking.

References: [Gateway Chat Completions](https://vercel.com/docs/ai-gateway/sdks-and-apis/openai-chat-completions), [provider routing](https://vercel.com/docs/ai-gateway/models-and-providers/provider-filtering-and-ordering), [live model endpoint metadata](https://ai-gateway.vercel.sh/v1/models/openai/gpt-6-luna/endpoints).
