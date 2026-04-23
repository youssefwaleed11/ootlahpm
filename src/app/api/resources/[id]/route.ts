import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: resource } = await session.supabase
    .from('resources')
    .select('id, uploaded_by, organization_id')
    .eq('id', id)
    .single();
  if (!resource) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (resource.organization_id !== session.user.organization_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (session.user.role !== 'admin' && resource.uploaded_by !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await session.supabase.from('resources').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
