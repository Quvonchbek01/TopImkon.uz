'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/database.types';

import { readSupabaseEnv } from './env';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Browser Supabase client with the anonymous key. The session lives in cookies,
 * so the server sees the same user. Safe to call from several components: the
 * instance is reused for the lifetime of the page.
 */
export function createSupabaseBrowserClient() {
  if (!client) {
    const { url, anonKey } = readSupabaseEnv();
    client = createBrowserClient<Database>(url, anonKey);
  }

  return client;
}
