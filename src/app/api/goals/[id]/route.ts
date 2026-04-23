import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import type { GoalStatus } from '@/types/database';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    status?: GoalStatus;
    title?: string;
    description?: string;
    targetTasks?: number;
    dueDate?: string | null;
  };

  const { data: goal } = await session.supabase
    .from('personal_goals')
    .select('id, user_id, set_by, organization_id')
    .eq('id', id)
    .single();

  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (goal.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const isOwner = goal.user_id === session.user.id;
  const isSetter = goal.set_by === session.user.id;
  const isAdmin = session.user.role === 'admin';
  if (!isOwner && !isSetter && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) updates.status = body.status;
  if (body.title !== undefined && (isSetter || isAdmin)) updates.title = body.title.trim();
  if (body.description !== undefined && (isSetter || isAdmin))
    updates.description = body.description;
  if (body.targetTasks !== undefined && (isSetter || isAdmin))
    updates.target_tasks = body.targetTasks;
  if (body.dueDate !== undefined && (isSetter || isAdmin)) updates.due_date = body.dueDate;

  const { data: updated, error } = await session.supabase
    .from('personal_goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ goal: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: goal } = await session.supabase
    .from('personal_goals')
    .select('id, set_by, organization_id')
    .eq('id', id)
    .single();
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (goal.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (goal.set_by !== session.user.id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await session.supabase.from('personal_goals').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
