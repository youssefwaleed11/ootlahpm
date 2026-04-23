import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole, isSession } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await session.supabase
    .from('departments')
    .select('id, name, slug, description, color, icon, created_at, organization_id')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  if (data.organization_id !== session.user.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: members } = await session.supabase
    .from('department_members')
    .select(
      'id, role, position, joined_at, user:users(id, full_name, email, avatar_url, role, is_active)'
    )
    .eq('department_id', id);

  const { data: projects } = await session.supabase
    .from('projects')
    .select('id, name, status, priority')
    .eq('department_id', id);

  return NextResponse.json({ department: data, members: members ?? [], projects: projects ?? [] });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireRole('admin');
  if (!isSession(session)) return session;

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  };

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description;
  if (body.color !== undefined) updates.color = body.color;
  if (body.icon !== undefined) updates.icon = body.icon;

  const { data, error } = await session.supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', session.user.organization_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'department_updated',
    resource_type: 'department',
    resource_id: id,
    changes: updates,
  });

  return NextResponse.json({ department: data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireRole('admin');
  if (!isSession(session)) return session;

  // Block deletion if the department still owns projects — caller must reassign/archive first.
  const { count: projectCount } = await session.supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', id);

  if ((projectCount ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `Department has ${projectCount} project(s). Archive or reassign them before deletion.`,
      },
      { status: 409 }
    );
  }

  const { error } = await session.supabase
    .from('departments')
    .delete()
    .eq('id', id)
    .eq('organization_id', session.user.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'department_deleted',
    resource_type: 'department',
    resource_id: id,
  });

  return NextResponse.json({ ok: true });
}
