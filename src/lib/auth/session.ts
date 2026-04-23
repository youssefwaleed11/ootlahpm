import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import type { User, UserRole } from '@/types/database';

export interface SessionContext {
  supabase: SupabaseClient;
  authUserId: string;
  user: User;
}

/**
 * Read the current session from cookies and return the app user profile.
 * Returns `null` when unauthenticated or when the profile row is missing.
 */
export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from('users')
    .select(
      'id, organization_id, email, full_name, avatar_url, role, is_active, position, preferences, last_login, theme_preference, created_at, updated_at'
    )
    .eq('id', authUser.id)
    .single();

  if (!profile) return null;

  return { supabase, authUserId: authUser.id, user: profile as User };
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden(reason = 'Forbidden') {
  return NextResponse.json({ error: reason }, { status: 403 });
}

/**
 * Assert the current user has one of the allowed roles.
 * Returns the session on success, or an error NextResponse on failure.
 */
export async function requireRole(...roles: UserRole[]): Promise<SessionContext | NextResponse> {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!session.user.is_active) return forbidden('Account disabled');
  if (roles.length && !roles.includes(session.user.role)) {
    return forbidden(`Requires role: ${roles.join(' or ')}`);
  }
  return session;
}

export function isSession(value: SessionContext | NextResponse): value is SessionContext {
  return !(value instanceof NextResponse);
}

/** Department ids the user is a member of (team_leader/agent scope). */
export async function getUserDepartmentIds(session: SessionContext): Promise<string[]> {
  const { data } = await session.supabase
    .from('department_members')
    .select('department_id')
    .eq('user_id', session.user.id);

  return (data ?? []).map((row) => row.department_id as string);
}
