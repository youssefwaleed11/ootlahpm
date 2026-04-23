import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';
import { createNotification } from '@/lib/auth/notifications';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

  const { comment } = (await request.json()) as { comment?: string };
  if (!comment || comment.trim().length < 3) {
    return NextResponse.json(
      { error: 'A comment explaining the required changes is required.' },
      { status: 400 }
    );
  }

  const { data: task, error: tErr } = await session.supabase
    .from('tasks')
    .select('id, status, assigned_to, department_id, project_id, organization_id, title')
    .eq('id', id)
    .single();
  if (tErr || !task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (task.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (!deptIds.includes(task.department_id)) {
      return NextResponse.json(
        { error: 'You can only reject tasks in your own department.' },
        { status: 403 }
      );
    }
  }

  const { error } = await session.supabase
    .from('tasks')
    .update({
      status: 'changes_requested',
      approval_comment: comment.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'task_rejected',
    resource_type: 'task',
    resource_id: id,
    changes: { comment },
  });

  if (task.assigned_to) {
    await createNotification(session.supabase, {
      organization_id: session.user.organization_id,
      user_id: task.assigned_to,
      from_user_id: session.user.id,
      type: 'task_rejected',
      title: 'Changes requested on your task',
      body: comment,
      task_id: id,
      project_id: task.project_id,
    });
  }

  return NextResponse.json({ ok: true });
}
