import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserDepartmentIds } from '@/lib/auth/session';
import { createNotification } from '@/lib/auth/notifications';
import { writeAudit } from '@/lib/auth/audit';
import type { GoalPeriod } from '@/types/database';

function periodStart(period: GoalPeriod): Date {
  const d = new Date();
  switch (period) {
    case 'week':
      return new Date(d.getTime() - 7 * 86400_000);
    case 'month':
      return new Date(d.getTime() - 30 * 86400_000);
    case 'quarter':
      return new Date(d.getTime() - 90 * 86400_000);
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') ?? session.user.id;

  if (userId !== session.user.id && session.user.role === 'agent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: goals, error } = await session.supabase
    .from('personal_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-update current_progress for active goals
  const updated = await Promise.all(
    (goals ?? []).map(async (g) => {
      if (g.status !== 'active') return g;
      const since = periodStart(g.target_period).toISOString();
      const { count } = await session.supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', g.user_id)
        .eq('status', 'done')
        .gte('completed_at', since);
      const progress = count ?? 0;
      if (progress !== g.current_progress) {
        await session.supabase
          .from('personal_goals')
          .update({ current_progress: progress })
          .eq('id', g.id);
      }
      return { ...g, current_progress: progress };
    })
  );

  return NextResponse.json({ goals: updated });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role === 'agent') {
    return NextResponse.json(
      { error: 'Only admins and team leaders can set goals.' },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    userId?: string;
    title?: string;
    description?: string;
    targetTasks?: number;
    targetPeriod?: GoalPeriod;
    dueDate?: string;
  };

  if (!body.userId || !body.title) {
    return NextResponse.json({ error: 'userId and title are required.' }, { status: 400 });
  }

  // team_leader can only set goals for users in their departments
  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    const { data: membership } = await session.supabase
      .from('department_members')
      .select('department_id')
      .eq('user_id', body.userId)
      .in('department_id', deptIds);
    if (!membership || membership.length === 0) {
      return NextResponse.json(
        { error: 'You can only set goals for your team members.' },
        { status: 403 }
      );
    }
  }

  const { data: goal, error } = await session.supabase
    .from('personal_goals')
    .insert({
      organization_id: session.user.organization_id,
      user_id: body.userId,
      set_by: session.user.id,
      title: body.title.trim(),
      description: body.description ?? null,
      target_tasks: body.targetTasks ?? 0,
      target_period: body.targetPeriod ?? 'month',
      due_date: body.dueDate ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'goal_set',
    resource_type: 'personal_goal',
    resource_id: goal.id,
    changes: { userId: body.userId, title: body.title },
  });

  await createNotification(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: body.userId,
    from_user_id: session.user.id,
    type: 'goal_set',
    title: 'A new personal goal was set for you',
    body: body.title,
  });

  return NextResponse.json({ goal }, { status: 201 });
}
