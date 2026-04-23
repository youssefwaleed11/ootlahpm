import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';
import { createNotification, notifyMany } from '@/lib/auth/notifications';
import type { TaskStatus } from '@/types/database';

interface Params {
  params: Promise<{ id: string }>;
}

const AGENT_TRANSITIONS: Record<string, TaskStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['in_review'],
  changes_requested: ['in_progress'],
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status, comment } = (await request.json()) as {
    status?: TaskStatus;
    comment?: string;
  };

  if (!status) {
    return NextResponse.json({ error: 'status is required.' }, { status: 400 });
  }

  const { data: task, error: tErr } = await session.supabase
    .from('tasks')
    .select(
      'id, status, assigned_to, department_id, project_id, organization_id, title, blocked_by'
    )
    .eq('id', id)
    .single();
  if (tErr || !task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (task.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (session.user.role === 'agent') {
    const allowed = AGENT_TRANSITIONS[task.status] ?? [];
    if (task.assigned_to !== session.user.id || !allowed.includes(status)) {
      return NextResponse.json({ error: 'Only Team Leaders can approve tasks.' }, { status: 403 });
    }
    if (status === 'done') {
      return NextResponse.json({ error: 'Agents cannot mark tasks as done.' }, { status: 403 });
    }
  } else if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (!deptIds.includes(task.department_id)) {
      return NextResponse.json(
        { error: 'You can only change status of tasks in your department.' },
        { status: 403 }
      );
    }
  }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === 'done') {
    updates.completed_at = new Date().toISOString();
    if (session.user.role !== 'agent') updates.approved_by = session.user.id;
  }
  if (status === 'changes_requested') {
    updates.approval_comment = comment ?? null;
  }

  const { error } = await session.supabase.from('tasks').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'task_status_changed',
    resource_type: 'task',
    resource_id: id,
    changes: { from: task.status, to: status, comment: comment ?? null },
  });

  // ── Notifications ─────────────────────────────────────────────
  if (status === 'in_review') {
    // Notify team leaders of the task's department
    const { data: leaders } = await session.supabase
      .from('department_members')
      .select('user_id')
      .eq('department_id', task.department_id)
      .eq('role', 'team_leader');
    const leaderIds = (leaders ?? []).map((l) => l.user_id as string);
    await notifyMany(session.supabase, leaderIds, {
      organization_id: session.user.organization_id,
      from_user_id: session.user.id,
      type: 'approval_requested',
      title: 'Task awaiting approval',
      body: task.title,
      task_id: id,
      project_id: task.project_id,
    });
  }

  if (status === 'done' && task.assigned_to) {
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
  }

  if (status === 'changes_requested' && task.assigned_to) {
    await createNotification(session.supabase, {
      organization_id: session.user.organization_id,
      user_id: task.assigned_to,
      from_user_id: session.user.id,
      type: 'task_rejected',
      title: 'Changes requested on your task',
      body: comment ?? task.title,
      task_id: id,
      project_id: task.project_id,
    });
  }

  return NextResponse.json({ ok: true, status });
}
