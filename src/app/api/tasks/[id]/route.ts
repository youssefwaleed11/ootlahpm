import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole, isSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';
import { createNotification } from '@/lib/auth/notifications';
import type { TaskStatus } from '@/types/database';

interface Params {
  params: Promise<{ id: string }>;
}

const DETAIL_SELECT = `
  id, title, description, status, priority, due_date, start_date,
  assigned_to, created_by, project_id, department_id, organization_id,
  approval_comment, approved_by, completed_at, blocked_by, tags, attachment_count,
  created_at, updated_at,
  assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url, email),
  creator:users!tasks_created_by_fkey(id, full_name, avatar_url),
  project:projects(id, name, slug, department_id),
  department:departments(id, name, color)
`;

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: task, error } = await session.supabase
    .from('tasks')
    .select(DETAIL_SELECT)
    .eq('id', id)
    .single();

  if (error || !task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (task.organization_id !== session.user.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [{ data: comments }, { data: attachments }] = await Promise.all([
    session.supabase
      .from('task_comments')
      .select('id, content, mentions, created_at, author:users(id, full_name, avatar_url)')
      .eq('task_id', id)
      .order('created_at', { ascending: true }),
    session.supabase.from('attachments').select('*').eq('task_id', id),
  ]);

  return NextResponse.json({
    task,
    comments: comments ?? [],
    attachments: attachments ?? [],
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: string;
    assignedTo: string | null;
    startDate: string | null;
    dueDate: string | null;
    tags: string[];
    blockedBy: string[];
  }>;

  const { data: existing, error: eErr } = await session.supabase
    .from('tasks')
    .select('id, status, assigned_to, department_id, organization_id, title')
    .eq('id', id)
    .single();
  if (eErr || !existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (existing.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Role-based edit rules
  if (session.user.role === 'agent') {
    const allowed =
      body.status !== undefined &&
      Object.keys(body).filter((k) => k !== 'status').length === 0 &&
      existing.assigned_to === session.user.id &&
      ((existing.status === 'todo' && body.status === 'in_progress') ||
        (existing.status === 'in_progress' && body.status === 'in_review'));
    if (!allowed) {
      return NextResponse.json(
        { error: 'Agents can only move their own tasks to in_progress or in_review.' },
        { status: 403 }
      );
    }
  } else if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (!deptIds.includes(existing.department_id)) {
      return NextResponse.json(
        { error: 'You can only modify tasks in your own department.' },
        { status: 403 }
      );
    }
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description;
  if (body.status !== undefined) updates.status = body.status;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.assignedTo !== undefined) updates.assigned_to = body.assignedTo;
  if (body.startDate !== undefined) updates.start_date = body.startDate;
  if (body.dueDate !== undefined) updates.due_date = body.dueDate;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.blockedBy !== undefined) updates.blocked_by = body.blockedBy;

  if (body.status === 'done') {
    updates.completed_at = new Date().toISOString();
  }

  const { data: task, error } = await session.supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select(DETAIL_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'task_updated',
    resource_type: 'task',
    resource_id: id,
    changes: body as Record<string, unknown>,
  });

  if (
    body.assignedTo !== undefined &&
    body.assignedTo &&
    body.assignedTo !== existing.assigned_to
  ) {
    await createNotification(session.supabase, {
      organization_id: session.user.organization_id,
      user_id: body.assignedTo,
      from_user_id: session.user.id,
      type: 'task_assigned',
      title: 'Task assigned to you',
      body: existing.title,
      task_id: id,
    });
  }

  return NextResponse.json({ task });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireRole('admin');
  if (!isSession(session)) return session;

  const { error } = await session.supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('organization_id', session.user.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'task_deleted',
    resource_type: 'task',
    resource_id: id,
  });

  return NextResponse.json({ ok: true });
}
