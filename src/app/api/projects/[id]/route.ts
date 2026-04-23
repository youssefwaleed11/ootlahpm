import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole, isSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: project, error } = await session.supabase
    .from('projects')
    .select(
      '*, department:departments(id, name, color, slug), creator:users!projects_created_by_fkey(id, full_name, avatar_url)'
    )
    .eq('id', id)
    .single();

  if (error || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  if (project.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [{ data: tasks }, { data: members }] = await Promise.all([
    session.supabase
      .from('tasks')
      .select('id, status, priority, title, due_date, assigned_to')
      .eq('project_id', id),
    session.supabase
      .from('project_members')
      .select('user_id, role, joined_at, user:users(id, full_name, email, avatar_url, role)')
      .eq('project_id', id),
  ]);

  return NextResponse.json({
    project,
    tasks: tasks ?? [],
    members: members ?? [],
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role === 'agent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: project } = await session.supabase
    .from('projects')
    .select('id, department_id, organization_id')
    .eq('id', id)
    .single();
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  if (project.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (!deptIds.includes(project.department_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const body = (await request.json()) as Partial<{
    name: string;
    description: string;
    clientName: string;
    status: string;
    priority: string;
    startDate: string | null;
    endDate: string | null;
  }>;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description;
  if (body.clientName !== undefined) updates.client_name = body.clientName;
  if (body.status !== undefined) updates.status = body.status;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.startDate !== undefined) updates.start_date = body.startDate;
  if (body.endDate !== undefined) updates.end_date = body.endDate;

  const { data: updated, error } = await session.supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'project_updated',
    resource_type: 'project',
    resource_id: id,
    changes: updates,
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireRole('admin');
  if (!isSession(session)) return session;

  const { error } = await session.supabase
    .from('projects')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', session.user.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'project_archived',
    resource_type: 'project',
    resource_id: id,
  });

  return NextResponse.json({ ok: true });
}
