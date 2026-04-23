import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from('department_members')
    .select('department_id, role, position, departments(id, name, slug, color)')
    .eq('user_id', user.id);

  return NextResponse.json({ user, departments: memberships ?? [] });
}
