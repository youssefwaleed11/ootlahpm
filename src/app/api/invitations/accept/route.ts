import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

/**
 * Finalise an invitation: create the Supabase auth user (or attach to an
 * existing one with the same email), insert the profile row, and record the
 * per-department membership with position.
 *
 * Enforces invite-only access: anyone without a valid token is rejected.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';

  if (!token || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Token and a password of at least 8 characters are required.' },
      { status: 400 },
    );
  }

  const service = createServiceClient();
  const { data: invite } = await service
    .from('invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
  }
  if (invite.status !== 'pending') {
    return NextResponse.json(
      { error: `This invitation is ${invite.status}.` },
      { status: 410 },
    );
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await service.from('invitations').update({ status: 'expired' }).eq('id', invite.id);
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  // 1. Create the auth user (email-confirmed, password set now).
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || invite.full_name || null,
      invitation_id: invite.id,
    },
  });

  if (createErr || !created.user) {
    // If the auth user already exists, we can't silently attach - require the
    // admin to intervene instead of overwriting credentials.
    return NextResponse.json(
      { error: createErr?.message ?? 'Could not create account' },
      { status: 400 },
    );
  }

  const userId = created.user.id;

  // 2. Insert (or upsert) the application profile. RLS is bypassed via the
  //    service key, so we explicitly constrain to the invitation's org.
  const { error: profileErr } = await service.from('users').upsert(
    {
      id: userId,
      organization_id: invite.organization_id,
      email: invite.email,
      full_name: fullName || invite.full_name || null,
      role: invite.role,
      position: invite.position,
      is_active: true,
      invited_by: invite.invited_by,
    },
    { onConflict: 'id' },
  );

  if (profileErr) {
    await service.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: `Could not create profile: ${profileErr.message}` },
      { status: 500 },
    );
  }

  // 3. Attach to the invited department (if any) with the stored position.
  if (invite.department_id) {
    await service.from('department_members').upsert(
      {
        user_id: userId,
        department_id: invite.department_id,
        role: invite.role,
        position: invite.position,
      },
      { onConflict: 'user_id,department_id' },
    );
  }

  // 4. Mark the invitation as accepted.
  await service
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  await service.from('audit_logs').insert({
    organization_id: invite.organization_id,
    user_id: userId,
    action: 'invitation_accepted',
    resource_type: 'invitation',
    resource_id: invite.id,
  });

  // 5. Sign the user in immediately so they can land in the app.
  const ssr = await createClient();
  await ssr.auth.signInWithPassword({ email: invite.email, password });

  return NextResponse.json({
    ok: true,
    user_id: userId,
    redirect_to: '/dashboard',
  });
}
