-- 0005_notifications_admin.sql
-- Notification queue and audit log. Both are server-only: RLS is enabled and
-- deliberately has no client policies, so only the service role (used in
-- src/lib/supabase/admin.ts) can read or write them.

create table public.notification_queue (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (
    kind in ('deadline_reminder', 'saved_search', 'welcome', 'system')
  ),
  channel text not null default 'email' check (channel in ('email', 'in_app', 'telegram')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  idempotency_key text not null unique,
  status text not null default 'pending' check (
    status in ('pending', 'sending', 'sent', 'failed', 'skipped')
  ),
  attempts int not null default 0 check (attempts >= 0),
  scheduled_for timestamptz not null default now(),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error text
);

create index notification_queue_status_scheduled_idx
  on public.notification_queue (status, scheduled_for);

create index notification_queue_user_created_idx
  on public.notification_queue (user_id, created_at desc);

alter table public.notification_queue enable row level security;

revoke all on public.notification_queue from anon, authenticated;
grant all on public.notification_queue to service_role;
grant usage, select on sequence public.notification_queue_id_seq to service_role;

create table public.audit_log (
  id bigserial primary key,
  actor uuid references auth.users (id) on delete set null,
  action text not null check (length(trim(action)) between 1 and 80),
  entity text not null check (length(trim(entity)) between 1 and 60),
  entity_id text,
  diff jsonb check (diff is null or jsonb_typeof(diff) = 'object'),
  created_at timestamptz not null default now()
);

create index audit_log_created_idx on public.audit_log (created_at desc);
create index audit_log_entity_idx on public.audit_log (entity, entity_id);

alter table public.audit_log enable row level security;

revoke all on public.audit_log from anon, authenticated;
grant all on public.audit_log to service_role;
grant usage, select on sequence public.audit_log_id_seq to service_role;
