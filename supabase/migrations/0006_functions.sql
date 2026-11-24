-- 0006_functions.sql
-- First version of the search RPC (Stage 4 replaces it with keyset pagination,
-- facets and eligibility filters) and the archive job helper.
-- ARCHITECTURE.md sections 5.4 and 6.

create or replace function public.search_opportunities(p_params jsonb default '{}'::jsonb)
returns table (
  id uuid,
  slug text,
  type text,
  country text,
  region text,
  city text,
  is_remote boolean,
  is_hybrid boolean,
  funding_type text,
  deadline_type text,
  deadline_date date,
  is_verified boolean,
  is_featured boolean,
  is_demo boolean,
  saves_count int,
  views_count int,
  organization_name text,
  title text,
  short_summary text,
  total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select
      nullif(trim(coalesce(p_params ->> 'query', '')), '') as query,
      coalesce(p_params ->> 'locale', 'en') as locale,
      least(greatest(coalesce((p_params ->> 'limit')::int, 20), 1), 100) as row_limit,
      greatest(coalesce((p_params ->> 'offset')::int, 0), 0) as row_offset,
      coalesce((p_params ->> 'include_expired')::boolean, false) as include_expired,
      coalesce((p_params ->> 'include_rolling')::boolean, true) as include_rolling,
      coalesce((p_params ->> 'remote_only')::boolean, false) as remote_only,
      coalesce((p_params ->> 'verified_only')::boolean, false) as verified_only,
      coalesce(p_params ->> 'sort', 'deadline') as sort
  ),
  filtered as (
    select
      o.*,
      org.name as organization_name,
      tr.title,
      tr.short_summary,
      case
        when p.query is not null
          then ts_rank(o.search_vector, websearch_to_tsquery('simple', p.query))
        else 0
      end as rank
    from public.opportunities o
    cross join params p
    left join public.organizations org on org.id = o.organization_id
    left join lateral (
      select t.title, t.short_summary
      from public.opportunity_translations t
      where t.opportunity_id = o.id
      order by case t.locale when p.locale then 0 when 'en' then 1 else 2 end
      limit 1
    ) tr on true
    where o.status = 'published'
      and (
        p.include_expired
        or o.deadline_date is null
        or o.deadline_date >= current_date
      )
      and (
        p.include_rolling
        or o.deadline_type = 'fixed'
      )
      and (
        p.query is null
        or o.search_vector @@ websearch_to_tsquery('simple', p.query)
        or o.search_text ilike '%' || lower(p.query) || '%'
        or extensions.similarity(o.search_text, lower(p.query)) > 0.25
      )
      and (
        jsonb_typeof(p_params -> 'types') is distinct from 'array'
        or jsonb_array_length(p_params -> 'types') = 0
        or o.type in (select jsonb_array_elements_text(p_params -> 'types'))
      )
      and (
        jsonb_typeof(p_params -> 'education_levels') is distinct from 'array'
        or jsonb_array_length(p_params -> 'education_levels') = 0
        or o.education_levels && (select array_agg(value) from jsonb_array_elements_text(p_params -> 'education_levels') as value)
      )
      and (
        jsonb_typeof(p_params -> 'fields_of_study') is distinct from 'array'
        or jsonb_array_length(p_params -> 'fields_of_study') = 0
        or o.fields_of_study && (select array_agg(value) from jsonb_array_elements_text(p_params -> 'fields_of_study') as value)
      )
      and (
        jsonb_typeof(p_params -> 'countries') is distinct from 'array'
        or jsonb_array_length(p_params -> 'countries') = 0
        or o.country in (select jsonb_array_elements_text(p_params -> 'countries'))
      )
      and (
        jsonb_typeof(p_params -> 'regions') is distinct from 'array'
        or jsonb_array_length(p_params -> 'regions') = 0
        or o.region in (select jsonb_array_elements_text(p_params -> 'regions'))
      )
      and (
        jsonb_typeof(p_params -> 'funding_types') is distinct from 'array'
        or jsonb_array_length(p_params -> 'funding_types') = 0
        or o.funding_type in (select jsonb_array_elements_text(p_params -> 'funding_types'))
      )
      and (
        p.remote_only is false
        or o.is_remote
        or o.is_hybrid
      )
      and (
        p.verified_only is false
        or o.is_verified
      )
      and (
        nullif(p_params ->> 'deadline_from', '') is null
        or o.deadline_date >= (p_params ->> 'deadline_from')::date
      )
      and (
        nullif(p_params ->> 'deadline_to', '') is null
        or o.deadline_date <= (p_params ->> 'deadline_to')::date
      )
      and (
        nullif(p_params ->> 'duration_min_months', '') is null
        or o.duration_months >= (p_params ->> 'duration_min_months')::int
      )
      and (
        nullif(p_params ->> 'duration_max_months', '') is null
        or o.duration_months <= (p_params ->> 'duration_max_months')::int
      )
  )
  select
    f.id,
    f.slug,
    f.type,
    f.country,
    f.region,
    f.city,
    f.is_remote,
    f.is_hybrid,
    f.funding_type,
    f.deadline_type,
    f.deadline_date,
    f.is_verified,
    f.is_featured,
    f.is_demo,
    f.saves_count,
    f.views_count,
    f.organization_name,
    f.title,
    f.short_summary,
    count(*) over () as total_count
  from filtered f
  cross join params p
  order by
    case when p.sort = 'newest' then f.created_at end desc nulls last,
    case when p.sort = 'popular' then f.saves_count end desc nulls last,
    case when p.sort = 'relevance' then f.rank end desc nulls last,
    f.deadline_date asc nulls last,
    f.created_at desc
  limit (select row_limit from params)
  offset (select row_offset from params);
$$;

comment on function public.search_opportunities(jsonb) is
  'Stage 2 search: text + taxonomy filters, sort, offset pagination, total count.';

grant execute on function public.search_opportunities(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- archive_expired(): moves listings whose fixed deadline passed more than
-- 7 days ago to `archived` (PROJECT_SPEC.md section 4.8). Called by the
-- /api/cron/archive-expired route in Stage 8; safe to run repeatedly.
-- ---------------------------------------------------------------------------
create or replace function public.archive_expired()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.opportunities
  set status = 'archived'
  where status = 'published'
    and deadline_type = 'fixed'
    and deadline_date < current_date - 7;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

comment on function public.archive_expired() is
  'Archives published listings whose fixed deadline passed more than 7 days ago.';

revoke execute on function public.archive_expired() from public;
grant execute on function public.archive_expired() to service_role;
