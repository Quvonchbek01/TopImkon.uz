import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

/**
 * Service-role client. It bypasses row level security, so **only** import it
 * from server code (server actions, route handlers, scheduled jobs) and never
 * return its results to the browser without checking permissions first.
 *
 * Used by the moderation tools and the notification worker, not by pages.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'The service-role client needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
