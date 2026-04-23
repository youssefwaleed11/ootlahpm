import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(100, Number(searchParams.get('limit') ?? 30));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = session.supabase
    .from('notifications')
    .select(
      'id, type, title, body, task_id, project_id, is_read, read_at, created_at, from_user:users!notifications_from_user_id_fkey(id, full_name, avatar_url)',
      { count: 'exact' }
    )
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (unreadOnly) q = q.eq('is_read', false);

  const { data, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { count: unreadCount } = await session.supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('is_read', false);

  const total = count ?? data?.length ?? 0;
  return NextResponse.json({
    notifications: data ?? [],
    unreadCount: unreadCount ?? 0,
    pagination: { total, page, limit, hasMore: from + (data?.length ?? 0) < total },
  });
}

export async function PATCH() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await session.supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', session.user.id)
    .eq('is_read', false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
