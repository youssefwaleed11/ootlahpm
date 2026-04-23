import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client that uses the service role key.
 * Only use in Route Handlers / Server Actions — never in browser code.
 * Required for: creating auth users, bypassing RLS for internal flows.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
