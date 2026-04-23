import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isSession, getUserDepartmentIds } from '@/lib/auth/session';

type Period = 'week' | 'month' | '3months' | '6months' | 'year';

function startForPeriod(period: Period): Date {
  const now = new Date();
  switch (period) {
    case 'week':
      return new Date(now.getTime() - 7 * 86400_000);
    case 'month':
      return new Date(now.getTime() - 30 * 86400_000);
    case '3months':
      return new Date(now.getTime() - 90 * 86400_000);
    case '6months':
      return new Date(now.getTime() - 180 * 86400_000);
    case 'year':
      return new Date(now.getTime() - 365 * 86400_000);
  }
}

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400_000));
}

export async function GET(request: NextRequest) {
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') as Period) || 'month';
  const departmentIdParam = searchParams.get('departmentId');
  const since = startForPeriod(period).toISOString();

  // Scope departments
  let deptQuery = session.supabase
    .from('departments')
    .select('id, name, color, slug')
    .eq('organization_id', session.user.organization_id);

  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (deptIds.length === 0)
      return NextResponse.json({ departments: [], employees: [], topPerformer: null });
    deptQuery = deptQuery.in('id', deptIds);
  }
  if (departmentIdParam) deptQuery = deptQuery.eq('id', departmentIdParam);

  const { data: departments } = await deptQuery;

  const deptIds = (departments ?? []).map((d) => d.id as string);
  if (deptIds.length === 0)
    return NextResponse.json({ departments: [], employees: [], topPerformer: null });

  // Fetch all tasks in scope for the period
  const { data: tasks } = await session.supabase
    .from('tasks')
    .select('id, status, department_id, assigned_to, created_at, completed_at, due_date')
    .in('department_id', deptIds)
    .gte('created_at', since);

  const now = new Date();
  const taskList = tasks ?? [];

  const deptStats = (departments ?? []).map((d) => {
    const dtasks = taskList.filter((t) => t.department_id === d.id);
    const completed = dtasks.filter((t) => t.status === 'done');
    const overdue = dtasks.filter(
      (t) => t.status !== 'done' && t.due_date && new Date(t.due_date).getTime() < now.getTime()
    );
    const avgDays =
      completed.length > 0
        ? completed.reduce(
            (acc, t) =>
              t.completed_at
                ? acc + daysBetween(t.created_at as string, t.completed_at as string)
                : acc,
            0
          ) / completed.length
        : 0;

    const perUser = new Map<string, number>();
    completed.forEach((t) => {
      if (t.assigned_to) {
        perUser.set(t.assigned_to as string, (perUser.get(t.assigned_to as string) ?? 0) + 1);
      }
    });
    const top = Array.from(perUser.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      id: d.id,
      name: d.name,
      color: d.color,
      slug: d.slug,
      totalTasks: dtasks.length,
      completedTasks: completed.length,
      completionRate: dtasks.length > 0 ? Math.round((completed.length / dtasks.length) * 100) : 0,
      overdueTasksCount: overdue.length,
      avgCompletionDays: Number(avgDays.toFixed(1)),
      topPerformerId: top?.[0] ?? null,
      topPerformerCompleted: top?.[1] ?? 0,
    };
  });

  // Employees: per-user metrics across scoped tasks
  const userIds = Array.from(
    new Set(taskList.map((t) => t.assigned_to).filter(Boolean) as string[])
  );
  const { data: userRows } = userIds.length
    ? await session.supabase
        .from('users')
        .select('id, full_name, avatar_url, email')
        .in('id', userIds)
    : { data: [] };

  // Current load snapshot (all in_progress, not bounded by period)
  const { data: loadRows } = userIds.length
    ? await session.supabase
        .from('tasks')
        .select('assigned_to')
        .in('assigned_to', userIds)
        .eq('status', 'in_progress')
    : { data: [] };
  const currentLoad = new Map<string, number>();
  (loadRows ?? []).forEach((r) => {
    currentLoad.set(r.assigned_to as string, (currentLoad.get(r.assigned_to as string) ?? 0) + 1);
  });

  const employees = (userRows ?? []).map((u) => {
    const mine = taskList.filter((t) => t.assigned_to === u.id);
    const done = mine.filter((t) => t.status === 'done');
    const onTime = done.filter(
      (t) =>
        t.completed_at &&
        t.due_date &&
        new Date(t.completed_at).getTime() <= new Date(t.due_date as string).getTime()
    );
    const overdue = mine.filter(
      (t) => t.status !== 'done' && t.due_date && new Date(t.due_date).getTime() < now.getTime()
    );
    return {
      userId: u.id,
      name: u.full_name,
      avatar: u.avatar_url,
      email: u.email,
      totalTasks: mine.length,
      completedTasks: done.length,
      completionRate: mine.length > 0 ? Math.round((done.length / mine.length) * 100) : 0,
      onTimeRate: done.length > 0 ? Math.round((onTime.length / done.length) * 100) : 0,
      overdueCount: overdue.length,
      currentLoad: currentLoad.get(u.id as string) ?? 0,
    };
  });

  const topPerformer =
    employees.length > 0
      ? [...employees].sort(
          (a, b) => b.completedTasks - a.completedTasks || b.onTimeRate - a.onTimeRate
        )[0]
      : null;

  return NextResponse.json({
    period,
    departments: deptStats,
    employees,
    topPerformer,
  });
}
