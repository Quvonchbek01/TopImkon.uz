import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import type { Database } from '@/lib/database.types';

/**
 * Row level security smoke tests against a local Supabase instance.
 *
 * ```bash
 * npm run supabase:start
 * npm run db:reset
 * $env:NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54321'
 * $env:NEXT_PUBLIC_SUPABASE_ANON_KEY='<anon key from npm run supabase:start>'
 * npm run test
 * ```
 *
 * Without those two variables the suite is skipped, so CI stays green when no
 * database is running. These tests only use the anonymous key: they prove what a
 * guest can and cannot reach. Signed-in rules are covered in Stage 3 together
 * with the auth flow.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasLocalDatabase = Boolean(url && anonKey);

const client = hasLocalDatabase
  ? createClient<Database>(url!, anonKey!, { auth: { persistSession: false } })
  : null;

describe.skipIf(!hasLocalDatabase)('row level security (guest)', () => {
  it('reads published listings', async () => {
    const { data, error } = await client!.from('opportunities').select('id, status').limit(10);

    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThan(0);
    expect(data?.every((row) => row.status === 'published')).toBe(true);
  });

  it('reads translations for published listings', async () => {
    const { data, error } = await client!
      .from('opportunity_translations')
      .select('opportunity_id, locale, title')
      .limit(10);

    expect(error).toBeNull();
    expect(data?.length ?? 0).toBeGreaterThan(0);
    expect(data?.every((row) => ['uz', 'ru', 'en'].includes(row.locale))).toBe(true);
  });

  it('cannot read staff-only and server-only tables', async () => {
    for (const table of ['admin_roles', 'notification_queue', 'audit_log'] as const) {
      const { data, error } = await client!.from(table).select('*').limit(1);
      expect(error, `${table} should be unreachable for a guest`).not.toBeNull();
      expect(data).toBeNull();
    }
  });

  it('cannot write to user tables', async () => {
    const { error } = await client!.from('saved_opportunities').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      opportunity_id: '00000000-0000-0000-0000-000000000000',
    });

    expect(error).not.toBeNull();
  });

  it('cannot create listings', async () => {
    const { error } = await client!.from('opportunities').insert({
      slug: 'rls-test-listing',
      type: 'internship',
      application_url: 'https://example.com/apply',
      source_url: 'https://example.com',
    });

    expect(error).not.toBeNull();
  });

  it('can run the search RPC and get a page of results', async () => {
    const { data, error } = await client!.rpc('search_opportunities', {
      p_params: { locale: 'en', limit: 5 },
    });

    expect(error).toBeNull();
    expect(data?.length).toBe(5);
    expect(data?.[0]?.total_count ?? 0).toBeGreaterThanOrEqual(5);
  });
});
