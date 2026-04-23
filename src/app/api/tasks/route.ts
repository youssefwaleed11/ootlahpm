import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';
import { createNotification } from '@/lib/auth/notifications';
import type { TaskStatus } from '@/types/database';

const TASK_SELECT = `
  id, title, description, status, priority, due_date, start_date,
  assigned_to, created_by, project_id, department_id,
  approval_comment, approved_by, completed_at, blocked_by, tags, attachment_count,
  created_at, updated_at,
  assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url),
  creator:users!tasks_created_by_fkey(id, full_name, avatar_url),
  project:projects(id, name, slug),
  department:departments(id, name, color)
`;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const status = searchParams.get('status');
  const assignedTo = searchParams.get('assignedTo');
  const priority = searchParams.get('priority');
  const departmentId = searchParams.get('departmentId');
  const search = searchParams.get('search');
  const overdue = searchParams.get('overdue') === 'true';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(200, Number(searchParams.get('limit') ?? 50));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = session.supabase
    .from('tasks')
    .select(TASK_SELECT, { count: 'exact' })
    .eq('organization_id', session.user.organization_id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (projectId) q = q.eq('project_id', projectId);
  if (status) q = q.eq('status', status);
  if (priority) q = q.eq('priority', priority);
  if (departmentId) q = q.eq('department_id', departmentId);
  if (search) q = q.ilike('title', `%${search}%`);
  if (overdue) {
    q = q
      .neq('status', 'done')
      .not('due_date', 'is', null)
      .lt('due_date', new Date().toISOString().slice(0, 10));
  }

  const assignee = assignedTo === 'me' ? session.user.id : (assignedTo ?? undefined);
  if (assignee) q = q.eq('assigned_to', assignee);

  // Role scope
  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (deptIds.length === 0) {
      return NextResponse.json({
        tasks: [],
        pagination: { total: 0, page, limit, hasMore: false },
      });
    }
    q = q.in('department_id', deptIds);
  } else if (session.user.role === 'agent') {
    // Agents: only tasks assigned to them OR in projects they are members of
    const { data: pm } = await session.supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', session.user.id);
    const projectIds = (pm ?? []).map((m) => m.project_id as string);
    if (projectIds.length > 0) {
      q = q.or(`assigned_to.eq.${session.user.id},project_id.in.(${projectIds.join(',')})`);
    } else {
      q = q.eq('assigned_to', session.user.id);
    }
  }

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? data?.length ?? 0;
  return NextResponse.json({
    tasks: data ?? [],
    pagination: { total, page, limit, hasMore: from + (data?.length ?? 0) < total },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role === 'agent') {
    return NextResponse.json({ error: 'Agents cannot create tasks.' }, { status: 403 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    projectId?: string;
    departmentId?: string;
    assignedTo?: string | null;
    priority?: string;
    startDate?: string | null;
    dueDate?: string | null;
    tags?: string[];
    blockedBy?: string[];
    status?: TaskStatus;
  };

  if (!body.title || body.title.trim().length < 3) {
    return NextResponse.json({ error: 'Title must be at least 3 characters.' }, { status: 400 });
  }
  if (!body.projectId) {
    return NextResponse.json({ error: 'projectId is required.' }, { status: 400 });
  }
  if (body.dueDate && new Date(body.dueDate).getTime() < Date.now() - 86400_000) {
    return NextResponse.json({ error: 'Due date cannot be in the past.' }, { status: 400 });
  }

  const { data: project, error: pErr } = await session.supabase
    .from('projects')
    .select('id, department_id, organization_id')
    .eq('id', body.projectId)
    .single();

  if (pErr || !project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }
  if (project.organization_id !== session.user.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Team leaders: must belong to project's department
  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (!deptIds.includes(project.department_id)) {
      return NextResponse.json(
        { error: 'You can only create tasks in your own department.' },
        { status: 403 }
      );
    }
  }

  const initialStatus: TaskStatus =
    body.status && ['backlog', 'todo'].includes(body.status) ? body.status : 'todo';

  const { data: task, error } = await session.supabase
    .from('tasks')
    .insert({
      organization_id: session.user.organization_id,
      project_id: project.id,
      department_id: project.department_id,
      title: body.title.trim(),
      description: body.description ?? null,
      status: initialStatus,
      priority: body.priority ?? 'medium',
      assigned_to: body.assignedTo ?? null,
      created_by: session.user.id,
      start_date: body.startDate ?? null,
      due_date: body.dueDate ?? null,
      blocked_by: body.blockedBy ?? [],
      tags: body.tags ?? [],
    })
    .select(TASK_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'task_created',
    resource_type: 'task',
    resource_id: task.id,
    changes: { title: task.title, status: task.status, assignedTo: body.assignedTo ?? null },
  });

  if (body.assignedTo && body.assignedTo !== session.user.id) {
    await createNotification(session.supabase, {
      organization_id: session.user.organization_id,
      user_id: body.assignedTo,
      from_user_id: session.user.id,
      type: 'task_assigned',
      title: 'New task assigned',
      body: task.title,
      task_id: task.id,
      project_id: task.project_id,
    });
  }

  return NextResponse.json({ task }, { status: 201 });
}
