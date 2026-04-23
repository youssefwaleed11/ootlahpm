import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const { data: memberships } = await session.supabase
    .from('department_members')
    .select('department_id, role, position, department:departments(id, name, slug, color, icon)')
    .eq('user_id', session.user.id);

  return NextResponse.json({
    user: session.user,
    memberships: memberships ?? [],
  });
}
