# Shared links and voluntary acknowledgements

Plain-text URLs in discussion bodies, replies, listing descriptions, location/contact text and preview cards are rendered through SharedText. HTTP, HTTPS and www addresses become escaped React anchors with a new-tab indicator, keyboard focus and noopener/noreferrer. Existing anchors and internal navigation remain separate. Previews may shorten displayed addresses while retaining the full destination. No stored content is rewritten; no user HTML is executed.

Seen & read is a voluntary member choice, never an automatic read receipt. Public pages expose aggregate counts and only the current member’s selected state. There is no voter list, notification or change to discussion activity ranking.

Two acknowledgement tables have composite primary keys (target_id, user_id) and cascading foreign keys. Desired-state upserts are idempotent under repeat/concurrent requests; inactive rows preserve the off state. The server rechecks the session version and target visibility, including reply/thread membership. If private topics or soft deletion are introduced, extend the shared discussion visibility predicates and acknowledgement boundary together.

Deploy the additive 0007 migration before the application release. Existing db:push installations can run scripts/apply-acknowledgement-schema.ts (dry run by default, --apply to execute atomically). Roll back the app independently; preserve the tables and member choices for recovery.

Validation includes escaped HTML, unsafe protocols, punctuation, complete URLs in truncated previews, non-nested anchors, isolated database tests for concurrent requests and deleted/revoked targets, and browser keyboard/mobile/new-tab checks. Test schemas are removed afterwards; test acknowledgements on real content must be returned to their original state.
