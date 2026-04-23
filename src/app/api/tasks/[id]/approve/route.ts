import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';
import { createNotification } from '@/lib/auth/notifications';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

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
        { error: 'You can only approve tasks in your own department.' },
        { status: 403 }
      );
    }
  }

  const { error } = await session.supabase
    .from('tasks')
    .update({
      status: 'done',
      approved_by: session.user.id,
      completed_at: new Date().toISOString(),
      approval_comment: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'task_approved',
    resource_type: 'task',
    resource_id: id,
  });

  if (task.assigned_to) {
    await createNotification(session.supabase, {
      organization_id: session.user.organization_id,
      user_id: task.assigned_to,
      from_user_id: session.user.id,
      type: 'task_approved',
      title: 'Task approved',
      body: task.title,
      task_id: id,
      project_id: task.project_id,
    });
  }

  // Unblock dependent tasks
  const { data: dependents } = await session.supabase
    .from('tasks')
    .select('id, title, assigned_to, blocked_by, project_id')
    .contains('blocked_by', [id]);

  for (const dep of dependents ?? []) {
    const newBlocked = (dep.blocked_by ?? []).filter((b: string) => b !== id);
    await session.supabase.from('tasks').update({ blocked_by: newBlocked }).eq('id', dep.id);
    if (newBlocked.length === 0 && dep.assigned_to) {
      await createNotification(session.supabase, {
        organization_id: session.user.organization_id,
        user_id: dep.assigned_to,
        from_user_id: session.user.id,
        type: 'task_unblocked',
        title: 'A task is now unblocked',
        body: dep.title,
        task_id: dep.id,
        project_id: dep.project_id,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
