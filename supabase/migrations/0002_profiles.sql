-- 0002_profiles.sql
-- User profile, notification preferences and staff roles.
-- PROJECT_SPEC.md section 5, ARCHITECTURE.md sections 5 and 8.
-- Every table enables Row Level Security in the same file that creates it.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on signup (below).
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (full_name is null or length(trim(full_name)) between 1 and 120),
  avatar_url text check (avatar_url is null or avatar_url ~* '^https?://'),
  date_of_birth date check (date_of_birth is null or date_of_birth > date '1900-01-01'),
  citizenship text not null default 'UZ' check (citizenship ~ '^[A-Z]{2}$'),
  education_level text check (
    education_level in ('high_school', 'bachelor', 'master', 'phd', 'graduate_early_career')
  ),
  university text check (university is null or length(trim(university)) between 1 and 160),
  fields_of_study text[] not null default '{}' check (
    fields_of_study <@ array[
      'computer_science_it', 'engineering', 'business_economics', 'finance', 'law',
      'medicine_health', 'natural_sciences', 'math_statistics', 'social_sciences',
      'humanities_languages', 'arts_design', 'education', 'agriculture_environment',
      'architecture_urban', 'journalism_media', 'public_policy_ir', 'energy_climate', 'any_field'
    ]::text[]
  ),
  gpa numeric check (gpa is null or gpa >= 0),
  gpa_scale numeric check (gpa_scale is null or gpa_scale in (4, 5, 100)),
  graduation_year int check (graduation_year is null or graduation_year between 1950 and 2100),
  language_certificates jsonb not null default '[]'::jsonb check (
    jsonb_typeof(language_certificates) = 'array'
  ),
  interested_types text[] not null default '{}' check (
    interested_types <@ array[
      'internship', 'summer_school', 'scholarship_bachelor', 'scholarship_master',
      'scholarship_phd', 'exchange', 'fellowship', 'research_program', 'grant',
      'competition', 'conference', 'volunteering', 'job_entry', 'course'
    ]::text[]
  ),
  interested_countries text[] not null default '{}' check (
    public.is_iso_country_list(interested_countries)
  ),
  interested_regions text[] not null default '{}' check (
    interested_regions <@ array[
      'europe', 'north_america', 'east_asia', 'south_east_asia', 'central_asia',
      'middle_east', 'africa', 'oceania', 'latin_america', 'online'
    ]::text[]
  ),
  funding_need text not null default 'any' check (
    funding_need in ('must_be_fully_funded', 'partial_ok', 'any')
  ),
  preferred_locale text not null default 'uz' check (preferred_locale in ('uz', 'ru', 'en')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_gpa_range check (gpa is null or gpa_scale is null or gpa <= gpa_scale)
);

comment on table public.profiles is 'Public-site user profile (PROJECT_SPEC.md section 5).';

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- notification_settings: one row per user, also created on signup.
-- ---------------------------------------------------------------------------
create table public.notification_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_enabled boolean not null default true,
  deadline_days int[] not null default '{7,3,1}' check (
    cardinality(deadline_days) > 0
    and deadline_days <@ array[1, 2, 3, 5, 7, 10, 14, 30]::int[]
  ),
  digest_frequency text not null default 'daily' check (
    digest_frequency in ('instant', 'daily', 'weekly')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notification_settings_set_updated_at
before update on public.notification_settings
for each row execute function public.set_updated_at();

alter table public.notification_settings enable row level security;

create policy notification_settings_select_own on public.notification_settings
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy notification_settings_insert_own on public.notification_settings
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy notification_settings_update_own on public.notification_settings
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- admin_roles: service role only. No policies means no client access at all.
-- ---------------------------------------------------------------------------
create table public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

alter table public.admin_roles enable row level security;

-- ---------------------------------------------------------------------------
-- Staff helpers. SECURITY DEFINER bypasses RLS on admin_roles; search_path is
-- pinned to an empty string so unqualified names cannot be hijacked.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_roles r
    where r.user_id = p_user_id
      and r.role = 'admin'
  );
$$;

create or replace function public.is_staff(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_roles r
    where r.user_id = p_user_id
      and r.role in ('admin', 'editor')
  );
$$;

comment on function public.is_admin(uuid) is 'True when the user has the admin role.';
comment on function public.is_staff(uuid) is 'True when the user is an admin or an editor.';

-- ---------------------------------------------------------------------------
-- handle_new_user(): creates the profile and notification settings rows on
-- signup (ARCHITECTURE.md section 8).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name, avatar_url)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(
      trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')),
      ''
    )
  )
  on conflict (user_id) do nothing;

  insert into public.notification_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
