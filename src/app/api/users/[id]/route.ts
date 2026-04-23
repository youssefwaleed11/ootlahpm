import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole, isSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAudit } from '@/lib/auth/audit';
import type { UserRole } from '@/types/database';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: target, error } = await session.supabase
    .from('users')
    .select(
      'id, email, full_name, avatar_url, role, is_active, position, created_at, organization_id'
    )
    .eq('id', id)
    .single();

  if (error || !target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (target.organization_id !== session.user.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: memberships } = await session.supabase
    .from('department_members')
    .select('department_id, role, position, department:departments(id, name, slug, color)')
    .eq('user_id', id);

  const { data: tasks } = await session.supabase
    .from('tasks')
    .select('id, status')
    .eq('assigned_to', id);

  const summary = {
    total: tasks?.length ?? 0,
    done: tasks?.filter((t) => t.status === 'done').length ?? 0,
    in_progress:
      tasks?.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length ?? 0,
  };

  return NextResponse.json({ user: target, memberships: memberships ?? [], tasks: summary });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isSelf = id === session.user.id;
  const isAdmin = session.user.role === 'admin';

  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json()) as Partial<{
    fullName: string;
    avatarUrl: string;
    role: UserRole;
    position: string;
    departmentId: string | null;
    isActive: boolean;
    preferences: Record<string, unknown>;
  }>;

  const updates: Record<string, unknown> = {};
  if (body.fullName !== undefined) updates.full_name = body.fullName;
  if (body.avatarUrl !== undefined) updates.avatar_url = body.avatarUrl;
  if (body.position !== undefined) updates.position = body.position;
  if (body.preferences !== undefined) updates.preferences = body.preferences;
  if (isAdmin && body.role !== undefined) updates.role = body.role;
  if (isAdmin && body.isActive !== undefined) updates.is_active = body.isActive;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await session.supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', session.user.organization_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Optional: attach/reassign a department for this user
  if (isAdmin && body.departmentId !== undefined) {
    // Keep other department memberships; add this one if missing.
    if (body.departmentId) {
      await session.supabase.from('department_members').upsert(
        {
          user_id: id,
          department_id: body.departmentId,
          role: updated.role,
          position: body.position ?? updated.position ?? null,
        },
        { onConflict: 'user_id,department_id' }
      );
    }
  }

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'user_updated',
    resource_type: 'user',
    resource_id: id,
    changes: body as Record<string, unknown>,
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireRole('admin');
  if (!isSession(session)) return session;

  if (id === session.user.id) {
    return NextResponse.json({ error: 'Cannot deactivate yourself.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', session.user.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'user_deactivated',
    resource_type: 'user',
    resource_id: id,
  });

  return NextResponse.json({ ok: true });
}
