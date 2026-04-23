import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

interface Params {
  params: Promise<{ id: string }>;
}

const EDIT_WINDOW_MS = 15 * 60 * 1000;

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: comment } = await session.supabase
    .from('task_comments')
    .select('id, author_id, created_at')
    .eq('id', id)
    .single();

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isAuthor = comment.author_id === session.user.id;
  const isAdmin = session.user.role === 'admin';
  const withinWindow = Date.now() - new Date(comment.created_at).getTime() < EDIT_WINDOW_MS;

  if (!isAdmin && !(isAuthor && withinWindow)) {
    return NextResponse.json(
      { error: 'You can only delete your own comments within 15 minutes.' },
      { status: 403 }
    );
  }

  const { error } = await session.supabase.from('task_comments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
