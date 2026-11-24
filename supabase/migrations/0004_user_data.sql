-- 0004_user_data.sql
-- Everything a signed-in user owns: saves, tracker, saved searches, events,
-- reports and suggestions. PROJECT_SPEC.md sections 5 and 10.
-- RLS rule: a user reads and writes only rows where user_id = auth.uid().

create table public.saved_opportunities (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create index saved_opportunities_opportunity_idx
  on public.saved_opportunities (opportunity_id);

create trigger saved_opportunities_sync_saves_count
after insert or delete on public.saved_opportunities
for each row execute function public.sync_opportunity_saves_count();

alter table public.saved_opportunities enable row level security;

create policy saved_opportunities_select_own on public.saved_opportunities
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy saved_opportunities_insert_own on public.saved_opportunities
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy saved_opportunities_delete_own on public.saved_opportunities
  for delete to authenticated
  using (user_id = (select auth.uid()));

create table public.tracker_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  status text not null default 'saved' check (
    status in ('saved', 'preparing', 'applied', 'interview', 'result')
  ),
  notes text check (notes is null or length(notes) <= 4000),
  reminder_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create index tracker_entries_user_status_idx
  on public.tracker_entries (user_id, status);

create trigger tracker_entries_set_updated_at
before update on public.tracker_entries
for each row execute function public.set_updated_at();

alter table public.tracker_entries enable row level security;

create policy tracker_entries_select_own on public.tracker_entries
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy tracker_entries_insert_own on public.tracker_entries
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy tracker_entries_update_own on public.tracker_entries
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy tracker_entries_delete_own on public.tracker_entries
  for delete to authenticated
  using (user_id = (select auth.uid()));

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  filters jsonb not null check (jsonb_typeof(filters) = 'object'),
  alert_frequency text not null default 'weekly' check (
    alert_frequency in ('instant', 'daily', 'weekly')
  ),
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index saved_searches_user_idx on public.saved_searches (user_id);

create trigger saved_searches_set_updated_at
before update on public.saved_searches
for each row execute function public.set_updated_at();

alter table public.saved_searches enable row level security;

create policy saved_searches_select_own on public.saved_searches
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy saved_searches_insert_own on public.saved_searches
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy saved_searches_update_own on public.saved_searches
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy saved_searches_delete_own on public.saved_searches
  for delete to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, delete on public.saved_opportunities to authenticated;
grant select, insert, update, delete on public.tracker_entries to authenticated;
grant select, insert, update, delete on public.saved_searches to authenticated;

-- ---------------------------------------------------------------------------
-- user_events: behaviour signals for For You (PROJECT_SPEC.md section 9).
-- Guests may log an event with user_id = null; nobody reads other people's.
-- ---------------------------------------------------------------------------
create table public.user_events (
  id bigserial primary key,
  user_id uuid references auth.users (id) on delete set null,
  opportunity_id uuid references public.opportunities (id) on delete cascade,
  event text not null check (
    event in ('view', 'click', 'save', 'unsave', 'dismiss', 'apply_click')
  ),
  created_at timestamptz not null default now()
);

create index user_events_user_created_idx
  on public.user_events (user_id, created_at desc);

create index user_events_opportunity_event_idx
  on public.user_events (opportunity_id, event, created_at desc);

alter table public.user_events enable row level security;

create policy user_events_insert_self_or_guest on public.user_events
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

create policy user_events_select_own on public.user_events
  for select to authenticated
  using (user_id = (select auth.uid()));

grant insert on public.user_events to anon, authenticated;
grant select on public.user_events to authenticated;

-- ---------------------------------------------------------------------------
-- reports: users flag a listing; only staff read the queue.
-- ---------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (reason in ('expired', 'wrong_info', 'scam', 'other')),
  details text check (details is null or length(details) <= 2000),
  status text not null default 'open' check (status in ('open', 'dismissed', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_status_created_idx on public.reports (status, created_at desc);
create index reports_opportunity_idx on public.reports (opportunity_id);

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

alter table public.reports enable row level security;

create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy reports_select_staff on public.reports
  for select to authenticated
  using (public.is_staff());

create policy reports_update_staff on public.reports
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant insert on public.reports to authenticated;
grant select, update on public.reports to authenticated;

-- ---------------------------------------------------------------------------
-- suggestions: "Suggest an opportunity" form; only staff read the queue.
-- ---------------------------------------------------------------------------
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  url text not null check (url ~* '^https?://[^ ]+$'),
  note text check (note is null or length(note) <= 2000),
  status text not null default 'new' check (status in ('new', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index suggestions_status_created_idx on public.suggestions (status, created_at desc);

create trigger suggestions_set_updated_at
before update on public.suggestions
for each row execute function public.set_updated_at();

alter table public.suggestions enable row level security;

create policy suggestions_insert_own on public.suggestions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy suggestions_select_staff on public.suggestions
  for select to authenticated
  using (public.is_staff());

create policy suggestions_update_staff on public.suggestions
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant insert on public.suggestions to authenticated;
grant select, update on public.suggestions to authenticated;
