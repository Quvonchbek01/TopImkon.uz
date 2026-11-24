import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/lib/database.types';

import { readSupabaseEnv } from './env';

/**
 * Server-side Supabase client that runs with the visitor's session.
 *
 * Row level security decides what the visitor may read, so this is the only
 * client pages and server actions should use for user data. Create one per
 * request; never store it in a module-level variable.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = readSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The session is refreshed by
          // middleware instead (Stage 3), so failing here is expected and safe.
        }
      },
    },
  });
}
