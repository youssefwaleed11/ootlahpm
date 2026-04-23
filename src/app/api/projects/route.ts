import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';
import { notifyMany } from '@/lib/auth/notifications';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const departmentId = searchParams.get('departmentId');
  const search = searchParams.get('search');
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(100, Number(searchParams.get('limit') ?? 12));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = session.supabase
    .from('projects')
    .select(
      'id, name, slug, description, client_name, status, priority, start_date, end_date, created_at, department:departments(id, name, color, slug), creator:users!projects_created_by_fkey(id, full_name)',
      { count: 'exact' }
    )
    .eq('organization_id', session.user.organization_id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status) q = q.eq('status', status);
  if (departmentId) q = q.eq('department_id', departmentId);
  if (search) q = q.ilike('name', `%${search}%`);

  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (deptIds.length === 0)
      return NextResponse.json({
        projects: [],
        pagination: { total: 0, page, limit, hasMore: false },
      });
    q = q.in('department_id', deptIds);
  } else if (session.user.role === 'agent') {
    const [{ data: pm }, { data: tasks }] = await Promise.all([
      session.supabase.from('project_members').select('project_id').eq('user_id', session.user.id),
      session.supabase.from('tasks').select('project_id').eq('assigned_to', session.user.id),
    ]);
    const ids = Array.from(
      new Set([
        ...(pm ?? []).map((m) => m.project_id as string),
        ...(tasks ?? []).map((t) => t.project_id as string),
      ])
    );
    if (ids.length === 0)
      return NextResponse.json({
        projects: [],
        pagination: { total: 0, page, limit, hasMore: false },
      });
    q = q.in('id', ids);
  }

  const { data: projects, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with task counts
  const enriched = await Promise.all(
    (projects ?? []).map(async (p) => {
      const [{ count: total }, { count: done }, { count: members }] = await Promise.all([
        session.supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', p.id),
        session.supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', p.id)
          .eq('status', 'done'),
        session.supabase
          .from('project_members')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', p.id),
      ]);
      return {
        ...p,
        task_count: total ?? 0,
        completed_task_count: done ?? 0,
        member_count: members ?? 0,
      };
    })
  );

  const total = count ?? enriched.length;
  return NextResponse.json({
    projects: enriched,
    pagination: { total, page, limit, hasMore: from + enriched.length < total },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role === 'agent') {
    return NextResponse.json({ error: 'Agents cannot create projects.' }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    departmentId?: string;
    clientName?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    endDate?: string;
  };

  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json(
      { error: 'Project name must be at least 2 characters.' },
      { status: 400 }
    );
  }

  let departmentId = body.departmentId;
  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (deptIds.length === 0) {
      return NextResponse.json(
        { error: 'You must belong to a department to create projects.' },
        { status: 403 }
      );
    }
    if (departmentId && !deptIds.includes(departmentId)) {
      return NextResponse.json(
        { error: 'You can only create projects in your own department.' },
        { status: 403 }
      );
    }
    departmentId = departmentId ?? deptIds[0];
  }

  if (!departmentId) {
    return NextResponse.json({ error: 'departmentId is required.' }, { status: 400 });
  }

  const slug = slugify(body.name);

  const { data: project, error } = await session.supabase
    .from('projects')
    .insert({
      organization_id: session.user.organization_id,
      department_id: departmentId,
      name: body.name.trim(),
      slug,
      description: body.description ?? null,
      client_name: body.clientName ?? null,
      status: 'active',
      priority: body.priority ?? 'medium',
      start_date: body.startDate ?? null,
      end_date: body.dueDate ?? body.endDate ?? null,
      created_by: session.user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await session.supabase
    .from('project_members')
    .insert({ project_id: project.id, user_id: session.user.id, role: 'owner' });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'project_created',
    resource_type: 'project',
    resource_id: project.id,
    changes: { name: project.name },
  });

  // Notify department members
  const { data: deptMembers } = await session.supabase
    .from('department_members')
    .select('user_id')
    .eq('department_id', departmentId);
  await notifyMany(
    session.supabase,
    (deptMembers ?? []).map((m) => m.user_id as string),
    {
      organization_id: session.user.organization_id,
      from_user_id: session.user.id,
      type: 'project_created',
      title: 'New project created',
      body: project.name,
      project_id: project.id,
    }
  );

  return NextResponse.json({ project }, { status: 201 });
}
