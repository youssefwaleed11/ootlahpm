import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Public endpoint used by /invite/accept/[token] to check whether a token
 * corresponds to a live invitation. Only non-sensitive fields are returned.
 */
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from('invitations')
    .select(
      `email, full_name, role, position, status, expires_at,
       organization:organizations(name),
       department:departments(id, name)`,
    )
    .eq('token', token)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });

  if (data.status !== 'pending') {
    return NextResponse.json(
      { error: `This invitation is ${data.status}.`, status: data.status },
      { status: 410 },
    );
  }
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await service.from('invitations').update({ status: 'expired' }).eq('token', token);
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  return NextResponse.json({ invitation: data });
}
