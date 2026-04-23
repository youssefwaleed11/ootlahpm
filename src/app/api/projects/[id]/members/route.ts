import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';

interface Params {
  params: Promise<{ id: string }>;
}

async function canManage(
  session: Awaited<ReturnType<typeof getSession>>,
  projectDepartmentId: string
): Promise<boolean> {
  if (!session) return false;
  if (session.user.role === 'admin') return true;
  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    return deptIds.includes(projectDepartmentId);
  }
  return false;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await session.supabase
    .from('project_members')
    .select('user_id, role, joined_at, user:users(id, full_name, email, avatar_url, role)')
    .eq('project_id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: projectId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: project } = await session.supabase
    .from('projects')
    .select('id, department_id, organization_id')
    .eq('id', projectId)
    .single();
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  if (project.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!(await canManage(session, project.department_id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, role } = (await request.json()) as {
    userId?: string;
    role?: 'owner' | 'member';
  };
  if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 });

  const { data: member, error } = await session.supabase
    .from('project_members')
    .upsert(
      { project_id: projectId, user_id: userId, role: role ?? 'member' },
      { onConflict: 'project_id,user_id' }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'project_member_added',
    resource_type: 'project_member',
    resource_id: member.id,
    changes: { projectId, userId },
  });

  return NextResponse.json({ member }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id: projectId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: project } = await session.supabase
    .from('projects')
    .select('id, department_id, organization_id')
    .eq('id', projectId)
    .single();
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  if (project.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!(await canManage(session, project.department_id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 });

  const { error } = await session.supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'project_member_removed',
    resource_type: 'project_member',
    changes: { projectId, userId },
  });

  return NextResponse.json({ ok: true });
}
