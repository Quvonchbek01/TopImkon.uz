import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { Locale } from '@/lib/i18n/routing';

import { isOpportunityType, type OpportunityType } from './types';

/**
 * Wrapper around the `search_opportunities(jsonb)` RPC (migration 0006).
 * Stage 2 only needs the first page; Stage 4 adds filters, facets and keyset
 * pagination on top of the same call.
 */
export type OpportunitySort = 'deadline' | 'newest' | 'popular' | 'relevance';

export type OpportunitySearchOptions = {
  locale: Locale;
  query?: string;
  types?: readonly OpportunityType[];
  limit?: number;
  offset?: number;
  includeExpired?: boolean;
  includeRolling?: boolean;
  remoteOnly?: boolean;
  verifiedOnly?: boolean;
  sort?: OpportunitySort;
};

export type OpportunityListItem = {
  id: string;
  slug: string;
  type: OpportunityType;
  country: string | null;
  region: string | null;
  city: string | null;
  isRemote: boolean;
  isHybrid: boolean;
  fundingType: string;
  deadlineType: string;
  /** ISO date (`YYYY-MM-DD`) or `null` when the deadline is rolling or unknown. */
  deadlineDate: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  isDemo: boolean;
  savesCount: number;
  viewsCount: number;
  organizationName: string | null;
  title: string;
  shortSummary: string | null;
};

export type OpportunitySearchResult = {
  items: OpportunityListItem[];
  totalCount: number;
};

type SearchRow = Database['public']['Functions']['search_opportunities']['Returns'][number];

function toListItem(row: SearchRow): OpportunityListItem | null {
  if (!isOpportunityType(row.type)) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    country: row.country,
    region: row.region,
    city: row.city,
    isRemote: row.is_remote ?? false,
    isHybrid: row.is_hybrid ?? false,
    fundingType: row.funding_type,
    deadlineType: row.deadline_type,
    deadlineDate: row.deadline_date,
    isVerified: row.is_verified ?? false,
    isFeatured: row.is_featured ?? false,
    isDemo: row.is_demo ?? false,
    savesCount: row.saves_count ?? 0,
    viewsCount: row.views_count ?? 0,
    organizationName: row.organization_name,
    title: row.title ?? row.slug,
    shortSummary: row.short_summary,
  };
}

export async function searchOpportunities(
  client: SupabaseClient<Database>,
  options: OpportunitySearchOptions,
): Promise<OpportunitySearchResult> {
  const { data, error } = await client.rpc('search_opportunities', {
    p_params: {
      locale: options.locale,
      query: options.query ?? '',
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
      include_expired: options.includeExpired ?? false,
      include_rolling: options.includeRolling ?? true,
      remote_only: options.remoteOnly ?? false,
      verified_only: options.verifiedOnly ?? false,
      sort: options.sort ?? 'deadline',
      ...(options.types && options.types.length > 0 ? { types: [...options.types] } : {}),
    },
  });

  if (error) {
    throw new Error(`search_opportunities failed: ${error.message}`);
  }

  const rows = data ?? [];
  const items = rows.flatMap((row) => {
    const item = toListItem(row);
    return item ? [item] : [];
  });

  return { items, totalCount: rows[0] ? Number(rows[0].total_count) : 0 };
}
