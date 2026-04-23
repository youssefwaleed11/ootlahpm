import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Used server-side only for privileged operations
 * (creating auth users when accepting an invite, sending invite emails, etc.).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set. Never import this from a client
 * component - the service role key must never reach the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL must be set for privileged operations.',
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
