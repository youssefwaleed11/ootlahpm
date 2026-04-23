import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser, AppRole } from '@/lib/auth/session';
import {
  buildInviteUrl,
  generateInviteToken,
  inviteExpiryDate,
  isValidEmail,
} from '@/lib/invitations';

export async function GET(request: NextRequest) {
  const auth = await requireUser(['admin']);
  if ('response' in auth) return auth.response;

  const supabase = await createClient();
  const status = new URL(request.url).searchParams.get('status') ?? 'pending';

  let query = supabase
    .from('invitations')
    .select(
      `id, email, full_name, role, department_id, position, status,
       expires_at, accepted_at, created_at, token,
       department:departments(id, name, color),
       inviter:users!invitations_invited_by_fkey(id, full_name, email)`,
    )
    .eq('organization_id', auth.user.organization_id)
    .order('created_at', { ascending: false });

  if (status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Expose a ready-to-share invite URL so admins can send it manually.
  const invitations = (data ?? []).map((row) => ({
    ...row,
    invite_url: row.status === 'pending' ? buildInviteUrl(row.token) : null,
  }));

  return NextResponse.json({ invitations });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(['admin']);
  if ('response' in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : null;
  const role: AppRole =
    body.role === 'admin' || body.role === 'team_leader' ? body.role : 'agent';
  const departmentId = typeof body.departmentId === 'string' ? body.departmentId : null;
  const position = typeof body.position === 'string' ? body.position.trim() || null : null;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Reject when the email already belongs to an active user in the org.
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('organization_id', auth.user.organization_id)
    .ilike('email', email)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      { error: 'A user with that email already exists in this workspace.' },
      { status: 409 },
    );
  }

  // Revoke any existing pending invites for the same email so there's only one
  // active token at a time.
  await supabase
    .from('invitations')
    .update({ status: 'revoked' })
    .eq('organization_id', auth.user.organization_id)
    .eq('status', 'pending')
    .ilike('email', email);

  if (departmentId) {
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .eq('id', departmentId)
      .eq('organization_id', auth.user.organization_id)
      .maybeSingle();
    if (!dept) {
      return NextResponse.json({ error: 'Unknown department' }, { status: 400 });
    }
  }

  const token = generateInviteToken();
  const expires_at = inviteExpiryDate();

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: auth.user.organization_id,
      email,
      full_name: fullName,
      role,
      department_id: departmentId,
      position,
      token,
      expires_at,
      invited_by: auth.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from('audit_logs').insert({
    organization_id: auth.user.organization_id,
    user_id: auth.user.id,
    action: 'invitation_created',
    resource_type: 'invitation',
    resource_id: invitation.id,
    changes: { email, role, department_id: departmentId, position },
  });

  return NextResponse.json(
    {
      invitation,
      invite_url: buildInviteUrl(token),
    },
    { status: 201 },
  );
}
