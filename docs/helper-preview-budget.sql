-- Explicit operator schema; never applied automatically by the app.
-- The separate one-time PR20 evaluation allowance was approved on 19 October 2026.
create table helper_preview_budgets (
  id text primary key,
  enabled boolean not null default false,
  expires_at timestamptz not null,
  limit_microusd integer not null default 0 check (limit_microusd between 0 and 5000000),
  reserved_microusd integer not null default 0 check (reserved_microusd >= 0 and reserved_microusd <= limit_microusd)
);
create table helper_preview_limits (
  budget_id text not null references helper_preview_budgets(id),
  user_id uuid not null references users(id) on delete cascade,
  window_start timestamptz not null,
  attempts integer not null,
  primary key (budget_id,user_id)
);
-- No INSERT, default budget, automatic refill, or recurring reset.
