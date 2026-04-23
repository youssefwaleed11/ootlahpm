import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: att } = await session.supabase
    .from('attachments')
    .select('id, uploaded_by, file_url, task_id')
    .eq('id', id)
    .single();

  if (!att) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.user.role !== 'admin' && att.uploaded_by !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await session.supabase.from('attachments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (att.task_id) {
    const { data: task } = await session.supabase
      .from('tasks')
      .select('attachment_count')
      .eq('id', att.task_id)
      .single();
    await session.supabase
      .from('tasks')
      .update({ attachment_count: Math.max(0, (task?.attachment_count ?? 1) - 1) })
      .eq('id', att.task_id);
  }

  return NextResponse.json({ ok: true });
}
