import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const auth = await requireUser(['admin']);
  if ('response' in auth) return auth.response;
  const { id } = await params;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('invitations')
    .select('id, status')
    .eq('id', id)
    .eq('organization_id', auth.user.organization_id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }
  if (existing.status !== 'pending') {
    return NextResponse.json(
      { error: `Cannot revoke an invitation with status "${existing.status}"` },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'revoked' })
    .eq('id', id)
    .eq('organization_id', auth.user.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from('audit_logs').insert({
    organization_id: auth.user.organization_id,
    user_id: auth.user.id,
    action: 'invitation_revoked',
    resource_type: 'invitation',
    resource_id: id,
  });

  return NextResponse.json({ ok: true });
}
