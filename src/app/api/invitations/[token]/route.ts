import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole, isSession } from '@/lib/auth/session';

interface Params {
  params: Promise<{ token: string }>;
}

/** Public: look up an invitation by token. Returns minimal safe info for the accept page. */
export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: invite, error } = await admin
    .from('invitations')
    .select(
      'email, full_name, role, position, status, expires_at, department:departments(name, slug, color)'
    )
    .eq('token', token)
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
  }

  if (invite.status !== 'pending') {
    return NextResponse.json(
      { error: `Invitation is ${invite.status}.`, invitation: invite },
      { status: 410 }
    );
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { error: 'Invitation has expired.', invitation: invite },
      { status: 410 }
    );
  }

  return NextResponse.json({ invitation: invite });
}

/** Admin/team leader: revoke a pending invitation. */
export async function DELETE(_req: Request, { params }: Params) {
  const { token } = await params;
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

  const { data: invite } = await session.supabase
    .from('invitations')
    .select('id, organization_id, status')
    .eq('token', token)
    .single();

  if (!invite) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (invite.organization_id !== session.user.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (invite.status !== 'pending') {
    return NextResponse.json(
      { error: `Cannot revoke invitation in ${invite.status} state.` },
      { status: 400 }
    );
  }

  const { error } = await session.supabase
    .from('invitations')
    .update({ status: 'revoked' })
    .eq('id', invite.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
