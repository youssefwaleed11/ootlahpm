import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type AppRole = 'admin' | 'team_leader' | 'agent';

export interface SessionUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  organization_id: string;
  position: string | null;
  is_active: boolean;
}

/**
 * Load the currently authenticated user plus their profile row. Returns null if
 * no valid session exists or the user has no matching profile / is disabled.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url, role, organization_id, position, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  if (data.is_active === false) return null;
  return data as SessionUser;
}

/**
 * Helper for route handlers: enforces auth + an optional role allow-list. If
 * the check fails, returns a NextResponse so the caller can `return` it.
 */
export async function requireUser(
  allowed?: AppRole[],
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const user = await getSessionUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  if (allowed && !allowed.includes(user.role)) {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { user };
}
