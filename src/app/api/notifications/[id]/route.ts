import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as { isRead?: boolean };
  const isRead = body.isRead ?? true;

  const { data, error } = await session.supabase
    .from('notifications')
    .update({ is_read: isRead, read_at: isRead ? new Date().toISOString() : null })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notification: data });
}
