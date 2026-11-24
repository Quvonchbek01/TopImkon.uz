-- 0001_init.sql
-- Extensions and small helper functions shared by every table.
-- Naming rule (ARCHITECTURE.md section 5): numbered files, never edit one that
-- has already been applied to a project. Add a new numbered file instead.

-- Typo-tolerant search and accent-insensitive text (ARCHITECTURE.md section 5).
-- pgcrypto is only needed for gen_random_uuid() on PostgreSQL older than 13.
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- set_updated_at(): BEFORE UPDATE trigger that keeps updated_at honest.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- is_iso_country_list(): true when every element is an ISO 3166-1 alpha-2
-- code. Used by CHECK constraints on text[] columns, so it must be IMMUTABLE.
-- ---------------------------------------------------------------------------
create or replace function public.is_iso_country_list(p_countries text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(bool_and(value ~ '^[A-Z]{2}$'), true)
  from unnest(coalesce(p_countries, '{}'::text[])) as value;
$$;

comment on function public.is_iso_country_list(text[]) is
  'CHECK helper: every array element looks like an ISO 3166-1 alpha-2 country code.';
