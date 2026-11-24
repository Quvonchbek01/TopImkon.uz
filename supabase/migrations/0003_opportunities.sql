-- 0003_opportunities.sql
-- Organizations, listings and their translations.
-- PROJECT_SPEC.md sections 4 and 5, ARCHITECTURE.md sections 5.1 to 5.3.
-- Taxonomy values are CHECK constraints: they are part of the public API
-- (`/explore?type=...`) and must stay stable.

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  website text check (website is null or website ~* '^https?://[^ ]+$'),
  logo_url text check (logo_url is null or logo_url ~* '^https?://[^ ]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index organizations_name_lower_key on public.organizations (lower(name));

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  organization_id uuid references public.organizations (id) on delete set null,
  type text not null check (
    type in (
      'internship', 'summer_school', 'scholarship_bachelor', 'scholarship_master',
      'scholarship_phd', 'exchange', 'fellowship', 'research_program', 'grant',
      'competition', 'conference', 'volunteering', 'job_entry', 'course'
    )
  ),
  country text check (country is null or country ~ '^[A-Z]{2}$'),
  region text check (
    region is null or region in (
      'europe', 'north_america', 'east_asia', 'south_east_asia', 'central_asia',
      'middle_east', 'africa', 'oceania', 'latin_america', 'online'
    )
  ),
  city text check (city is null or length(trim(city)) between 1 and 120),
  is_remote boolean not null default false,
  is_hybrid boolean not null default false,
  funding_type text not null default 'unknown' check (
    funding_type in ('fully_funded', 'partially_funded', 'stipend_paid', 'unfunded', 'unknown')
  ),
  funding_details text,
  stipend_amount numeric check (stipend_amount is null or stipend_amount >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  deadline_type text not null default 'fixed' check (
    deadline_type in ('fixed', 'rolling', 'yearly_recurring', 'unknown')
  ),
  deadline_date date,
  start_date date,
  duration_months int check (duration_months is null or duration_months between 0 and 120),
  education_levels text[] not null default '{}' check (
    education_levels <@ array['high_school', 'bachelor', 'master', 'phd', 'graduate_early_career']::text[]
  ),
  fields_of_study text[] not null default '{}' check (
    fields_of_study <@ array[
      'computer_science_it', 'engineering', 'business_economics', 'finance', 'law',
      'medicine_health', 'natural_sciences', 'math_statistics', 'social_sciences',
      'humanities_languages', 'arts_design', 'education', 'agriculture_environment',
      'architecture_urban', 'journalism_media', 'public_policy_ir', 'energy_climate', 'any_field'
    ]::text[]
  ),
  nationality_rule text not null default 'open_to_all' check (
    nationality_rule in ('open_to_all', 'only_listed', 'excluded_listed')
  ),
  nationality_countries text[] not null default '{}' check (
    public.is_iso_country_list(nationality_countries)
  ),
  uzbekistan_eligible boolean not null default true,
  min_gpa numeric check (min_gpa is null or min_gpa >= 0),
  gpa_scale numeric check (gpa_scale is null or gpa_scale in (4, 5, 100)),
  age_min int check (age_min is null or age_min between 10 and 100),
  age_max int check (age_max is null or age_max between 10 and 100),
  language_requirements jsonb not null default '[]'::jsonb check (
    jsonb_typeof(language_requirements) = 'array'
  ),
  required_documents text[] not null default '{}' check (
    required_documents <@ array[
      'cv', 'motivation_letter', 'recommendation_letters', 'transcript', 'passport',
      'language_certificate', 'portfolio', 'research_proposal', 'other'
    ]::text[]
  ),
  application_url text not null check (application_url ~* '^https?://[^ ]+$'),
  source_url text not null check (source_url ~* '^https?://[^ ]+$'),
  is_verified boolean not null default false,
  last_verified_at timestamptz,
  is_featured boolean not null default false,
  is_demo boolean not null default false,
  status text not null default 'draft' check (
    status in ('draft', 'published', 'archived', 'reported_hold')
  ),
  views_count int not null default 0 check (views_count >= 0),
  saves_count int not null default 0 check (saves_count >= 0),
  search_text text,
  search_vector tsvector,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_fixed_deadline_needs_date check (
    (deadline_type = 'fixed') = (deadline_date is not null)
  ),
  constraint opportunities_deadline_before_start check (
    deadline_date is null or start_date is null or deadline_date <= start_date
  ),
  constraint opportunities_age_range check (age_min is null or age_max is null or age_min <= age_max),
  constraint opportunities_gpa_range check (min_gpa is null or gpa_scale is null or min_gpa <= gpa_scale),
  constraint opportunities_remote_modes check (not (is_remote and is_hybrid)),
  constraint opportunities_online_region_is_remote check (
    region is distinct from 'online' or is_remote or is_hybrid
  )
);

comment on table public.opportunities is 'One row per listing (PROJECT_SPEC.md section 5).';

create table public.opportunity_translations (
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  locale text not null check (locale in ('uz', 'ru', 'en')),
  title text not null check (length(trim(title)) between 1 and 200),
  short_summary text check (short_summary is null or length(trim(short_summary)) <= 400),
  description_md text,
  benefits text,
  how_to_apply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (opportunity_id, locale)
);

create trigger opportunity_translations_set_updated_at
before update on public.opportunity_translations
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes (ARCHITECTURE.md section 5.2).
-- ---------------------------------------------------------------------------
create index opportunities_search_vector_idx
  on public.opportunities using gin (search_vector);

create index opportunities_search_text_trgm_idx
  on public.opportunities using gin (search_text extensions.gin_trgm_ops);

create index opportunities_education_levels_idx
  on public.opportunities using gin (education_levels);

create index opportunities_fields_of_study_idx
  on public.opportunities using gin (fields_of_study);

create index opportunities_status_deadline_idx
  on public.opportunities (status, deadline_date);

create index opportunities_type_idx on public.opportunities (type);
create index opportunities_country_idx on public.opportunities (country);
create index opportunities_funding_type_idx on public.opportunities (funding_type);
create index opportunities_featured_idx on public.opportunities (is_featured) where is_featured;
create index opportunities_organization_idx on public.opportunities (organization_id);
create index opportunities_deadline_date_idx on public.opportunities (deadline_date)
  where status = 'published';

create index opportunity_translations_title_trgm_idx
  on public.opportunity_translations using gin (title extensions.gin_trgm_ops);

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Search text and vector (ARCHITECTURE.md section 6).
-- One denormalized row per listing so Explore never joins at query time.
-- unaccent() is not IMMUTABLE, so the columns are filled by a trigger.
-- ---------------------------------------------------------------------------
create or replace function public.refresh_opportunity_search(p_opportunity_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_name text;
  v_text text;
  v_vector tsvector;
begin
  select o.name
  into v_org_name
  from public.opportunities op
  left join public.organizations o on o.id = op.organization_id
  where op.id = p_opportunity_id;

  select
    lower(
      extensions.unaccent(
        concat_ws(
          ' ',
          op.slug,
          coalesce(v_org_name, ''),
          coalesce(op.city, ''),
          coalesce(op.country, ''),
          coalesce(op.region, ''),
          array_to_string(op.fields_of_study, ' '),
          array_to_string(op.education_levels, ' '),
          string_agg(coalesce(t.title, ''), ' '),
          string_agg(coalesce(t.short_summary, ''), ' ')
        )
      )
    ),
    setweight(
      to_tsvector('simple', lower(extensions.unaccent(coalesce(string_agg(coalesce(t.title, ''), ' '), '')))),
      'A'
    )
    || setweight(
      to_tsvector('english', coalesce(string_agg(t.title, ' ') filter (where t.locale = 'en'), '')),
      'A'
    )
    || setweight(
      to_tsvector('russian', coalesce(string_agg(t.title, ' ') filter (where t.locale = 'ru'), '')),
      'A'
    )
    || setweight(
      to_tsvector('simple', lower(extensions.unaccent(coalesce(v_org_name, '')))),
      'B'
    )
    || setweight(
      to_tsvector(
        'simple',
        lower(extensions.unaccent(coalesce(string_agg(coalesce(t.short_summary, ''), ' '), '')))
      ),
      'C'
    )
  into v_text, v_vector
  from public.opportunities op
  left join public.opportunity_translations t on t.opportunity_id = op.id
  where op.id = p_opportunity_id
  group by op.id;

  -- The IS DISTINCT FROM guard stops the trigger from recursing: the second
  -- run computes the same values and updates zero rows.
  update public.opportunities
  set search_text = v_text,
      search_vector = v_vector
  where id = p_opportunity_id
    and (search_text is distinct from v_text or search_vector is distinct from v_vector);
end;
$$;

-- Trigger wrappers -----------------------------------------------------------
create or replace function public.trg_refresh_opportunity_search()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_opportunity_search(new.id);
  return new;
end;
$$;

create or replace function public.trg_refresh_translation_search()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_opportunity_search(old.opportunity_id);
    return old;
  end if;

  perform public.refresh_opportunity_search(new.opportunity_id);
  return new;
end;
$$;

create or replace function public.trg_refresh_organization_search()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  for v_id in
    select id from public.opportunities where organization_id = new.id
  loop
    perform public.refresh_opportunity_search(v_id);
  end loop;
  return new;
end;
$$;

create trigger opportunities_refresh_search
after insert or update of slug, organization_id, type, country, region, city,
  fields_of_study, education_levels
on public.opportunities
for each row execute function public.trg_refresh_opportunity_search();

create trigger opportunity_translations_refresh_search
after insert or update or delete on public.opportunity_translations
for each row execute function public.trg_refresh_translation_search();

create trigger organizations_refresh_search
after update of name on public.organizations
for each row execute function public.trg_refresh_organization_search();

-- ---------------------------------------------------------------------------
-- saves_count (ARCHITECTURE.md section 5.4). SECURITY DEFINER because a normal
-- user may insert into saved_opportunities but must not update the listing.
-- ---------------------------------------------------------------------------
create or replace function public.sync_opportunity_saves_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.opportunities
    set saves_count = saves_count + 1
    where id = new.opportunity_id;
    return new;
  end if;

  update public.opportunities
  set saves_count = greatest(saves_count - 1, 0)
  where id = old.opportunity_id;
  return old;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security (ARCHITECTURE.md section 5.3).
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_translations enable row level security;

-- Guests and signed-in users read only published listings (any status in RLS
-- would leak drafts, archived and reported_hold rows).
create policy opportunities_public_read on public.opportunities
  for select to anon, authenticated
  using (status = 'published');

create policy opportunities_staff_write on public.opportunities
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- A translation is visible only while its listing is published, or to staff.
create policy opportunity_translations_public_read on public.opportunity_translations
  for select to anon, authenticated
  using (
    public.is_staff()
    or exists (
      select 1
      from public.opportunities o
      where o.id = opportunity_translations.opportunity_id
        and o.status = 'published'
    )
  );

create policy opportunity_translations_staff_write on public.opportunity_translations
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Organizations are public reference data, but only while they have a
-- published listing (or for staff).
create policy organizations_public_read on public.organizations
  for select to anon, authenticated
  using (
    public.is_staff()
    or exists (
      select 1
      from public.opportunities o
      where o.organization_id = organizations.id
        and o.status = 'published'
    )
  );

create policy organizations_staff_write on public.organizations
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Table privileges. RLS still filters every row.
grant select on public.organizations, public.opportunities,
  public.opportunity_translations to anon, authenticated;
grant insert, update, delete on public.organizations, public.opportunities,
  public.opportunity_translations to authenticated;

-- Internal helpers are not part of the public API.
revoke execute on function public.refresh_opportunity_search(uuid) from public;
revoke execute on function public.trg_refresh_opportunity_search() from public;
revoke execute on function public.trg_refresh_translation_search() from public;
revoke execute on function public.trg_refresh_organization_search() from public;
revoke execute on function public.sync_opportunity_saves_count() from public;
