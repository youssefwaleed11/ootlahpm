import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { requireRole, isSession } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';
import type { UserRole } from '@/types/database';

const ROLES: UserRole[] = ['admin', 'team_leader', 'agent'];

export async function GET(request: NextRequest) {
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let q = session.supabase
    .from('invitations')
    .select(
      'id, email, full_name, role, department_id, position, status, expires_at, accepted_at, created_at, invited_by, department:departments(id, name, slug, color)'
    )
    .eq('organization_id', session.user.organization_id)
    .order('created_at', { ascending: false });

  if (status) q = q.eq('status', status);

  // Team leaders can only see invitations for their department
  if (session.user.role === 'team_leader') {
    const { data: mems } = await session.supabase
      .from('department_members')
      .select('department_id')
      .eq('user_id', session.user.id);
    const ids = (mems ?? []).map((m) => m.department_id as string);
    if (ids.length === 0) return NextResponse.json({ invitations: [] });
    q = q.in('department_id', ids);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invitations: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

  const body = (await request.json()) as {
    email?: string;
    fullName?: string;
    role?: UserRole;
    departmentId?: string;
    position?: string;
    expiresInDays?: number;
  };

  const email = body.email?.trim().toLowerCase();
  const role = body.role;
  const departmentId = body.departmentId ?? null;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }
  if (!role || !ROLES.includes(role)) {
    return NextResponse.json({ error: 'Valid role is required.' }, { status: 400 });
  }
  if (role !== 'admin' && !departmentId) {
    return NextResponse.json(
      { error: 'Team leaders and agents must be assigned to a department.' },
      { status: 400 }
    );
  }

  // Team leaders can only invite agents into their own department
  if (session.user.role === 'team_leader') {
    if (role !== 'agent') {
      return NextResponse.json({ error: 'Team leaders can only invite agents.' }, { status: 403 });
    }
    const { data: mems } = await session.supabase
      .from('department_members')
      .select('department_id')
      .eq('user_id', session.user.id);
    const ids = (mems ?? []).map((m) => m.department_id as string);
    if (!ids.includes(departmentId!)) {
      return NextResponse.json(
        { error: 'You can only invite users to your own department.' },
        { status: 403 }
      );
    }
  }

  // Reject if a user already exists for this email in the org
  const { data: existing } = await session.supabase
    .from('users')
    .select('id')
    .eq('organization_id', session.user.organization_id)
    .ilike('email', email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
  }

  // Revoke any stale pending invitation for the same email
  await session.supabase
    .from('invitations')
    .update({ status: 'revoked' })
    .eq('organization_id', session.user.organization_id)
    .ilike('email', email)
    .eq('status', 'pending');

  const token = randomBytes(24).toString('hex');
  const expires = new Date(
    Date.now() + (body.expiresInDays ?? 7) * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: invite, error } = await session.supabase
    .from('invitations')
    .insert({
      organization_id: session.user.organization_id,
      email,
      full_name: body.fullName ?? null,
      role,
      department_id: departmentId,
      position: body.position ?? null,
      token,
      invited_by: session.user.id,
      status: 'pending',
      expires_at: expires,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'invitation_sent',
    resource_type: 'invitation',
    resource_id: invite.id,
    changes: { email, role, departmentId, position: body.position ?? null },
  });

  return NextResponse.json(
    {
      invitation: invite,
      accept_url: `/sign-up-login-screen?invite=${token}`,
    },
    { status: 201 }
  );
}
