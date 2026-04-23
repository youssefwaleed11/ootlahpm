import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole, isSession } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';
import type { UserRole } from '@/types/database';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await session.supabase
    .from('department_members')
    .select(
      'id, role, position, joined_at, user:users(id, full_name, email, avatar_url, role, is_active)'
    )
    .eq('department_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: departmentId } = await params;
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

  const body = (await request.json()) as {
    userId?: string;
    role?: UserRole;
    position?: string;
  };

  if (!body.userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
  }

  // Team leaders can only add to their own department(s)
  if (session.user.role === 'team_leader') {
    const { data: ownMem } = await session.supabase
      .from('department_members')
      .select('department_id')
      .eq('user_id', session.user.id)
      .eq('department_id', departmentId)
      .maybeSingle();
    if (!ownMem) {
      return NextResponse.json(
        { error: 'You can only modify your own department.' },
        { status: 403 }
      );
    }
  }

  const { data, error } = await session.supabase
    .from('department_members')
    .upsert(
      {
        department_id: departmentId,
        user_id: body.userId,
        role: body.role ?? 'agent',
        position: body.position ?? null,
      },
      { onConflict: 'user_id,department_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'department_member_added',
    resource_type: 'department_member',
    resource_id: data.id,
    changes: { departmentId, userId: body.userId, role: body.role, position: body.position },
  });

  return NextResponse.json({ member: data }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id: departmentId } = await params;
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
  }

  if (session.user.role === 'team_leader') {
    const { data: ownMem } = await session.supabase
      .from('department_members')
      .select('department_id')
      .eq('user_id', session.user.id)
      .eq('department_id', departmentId)
      .maybeSingle();
    if (!ownMem) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { error } = await session.supabase
    .from('department_members')
    .delete()
    .eq('department_id', departmentId)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'department_member_removed',
    resource_type: 'department_member',
    changes: { departmentId, userId },
  });

  return NextResponse.json({ ok: true });
}
