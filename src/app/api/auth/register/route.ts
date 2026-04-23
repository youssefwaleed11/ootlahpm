import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/auth/audit';

/**
 * Invite-only registration.
 * A user may only create an account if they present a valid, unexpired,
 * non-revoked, non-accepted invitation token AND the email on the request
 * matches the invitation exactly. There is no public open sign-up.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, token } = (await request.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      token?: string;
    };

    if (!email || !password || !token) {
      return NextResponse.json(
        { error: 'Email, password, and invitation token are required.' },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = createAdminClient();

    const { data: invite, error: inviteErr } = await admin
      .from('invitations')
      .select(
        'id, organization_id, email, full_name, role, department_id, position, status, expires_at'
      )
      .eq('token', token)
      .single();

    if (inviteErr || !invite) {
      return NextResponse.json(
        { error: 'Invitation is invalid or no longer exists.' },
        { status: 403 }
      );
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: `Invitation is ${invite.status}.` }, { status: 403 });
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      await admin.from('invitations').update({ status: 'expired' }).eq('id', invite.id);
      return NextResponse.json(
        { error: 'Invitation has expired. Ask your admin for a new link.' },
        { status: 403 }
      );
    }

    if (invite.email.toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        { error: 'This email does not match the invitation.' },
        { status: 403 }
      );
    }

    // Create auth user
    const { data: authRes, error: authErr } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName ?? invite.full_name ?? null,
      },
    });

    if (authErr || !authRes.user) {
      return NextResponse.json(
        { error: authErr?.message ?? 'Failed to create account.' },
        { status: 400 }
      );
    }

    // Create users row
    const { error: profileErr } = await admin.from('users').insert({
      id: authRes.user.id,
      organization_id: invite.organization_id,
      email: normalizedEmail,
      full_name: fullName ?? invite.full_name ?? null,
      role: invite.role,
      position: invite.position,
      is_active: true,
    });

    if (profileErr) {
      await admin.auth.admin.deleteUser(authRes.user.id);
      return NextResponse.json(
        { error: 'Failed to provision profile: ' + profileErr.message },
        { status: 500 }
      );
    }

    if (invite.department_id) {
      await admin.from('department_members').insert({
        user_id: authRes.user.id,
        department_id: invite.department_id,
        role: invite.role,
        position: invite.position,
      });
    }

    await admin
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    await writeAudit(admin, {
      organization_id: invite.organization_id,
      user_id: authRes.user.id,
      action: 'user_created',
      resource_type: 'user',
      resource_id: authRes.user.id,
      changes: { via: 'invitation', invitation_id: invite.id },
    });

    return NextResponse.json({
      user: {
        id: authRes.user.id,
        email: normalizedEmail,
        full_name: fullName ?? invite.full_name ?? null,
        role: invite.role,
      },
      message: 'Account created. You can now sign in.',
    });
  } catch (err) {
    console.error('[auth/register] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
