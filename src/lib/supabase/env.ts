/**
 * Reads the browser-safe Supabase settings (ARCHITECTURE.md section 16).
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, which is why the
 * values are read here and not passed around from a config object.
 */
export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export function readSupabaseEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env.local and set ' +
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return { url, anonKey };
}
