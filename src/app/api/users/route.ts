import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('departmentId');
  const role = searchParams.get('role');
  const search = searchParams.get('search');

  let query = supabase
    .from('users')
    .select('id, email, full_name, avatar_url, role, position, is_active, created_at')
    .eq('organization_id', auth.user.organization_id)
    .order('created_at', { ascending: false });

  if (role) query = query.eq('role', role);
  if (search) query = query.ilike('full_name', `%${search}%`);

  if (departmentId) {
    const { data: members } = await supabase
      .from('department_members')
      .select('user_id')
      .eq('department_id', departmentId);
    const ids = (members ?? []).map((m) => m.user_id);
    if (ids.length === 0) return NextResponse.json({ users: [] });
    query = query.in('id', ids);
  }

  // team_leader: only users sharing at least one of their departments.
  if (auth.user.role === 'team_leader') {
    const { data: myDepts } = await supabase
      .from('department_members')
      .select('department_id')
      .eq('user_id', auth.user.id);
    const deptIds = (myDepts ?? []).map((d) => d.department_id);
    if (deptIds.length === 0) return NextResponse.json({ users: [auth.user] });
    const { data: peers } = await supabase
      .from('department_members')
      .select('user_id')
      .in('department_id', deptIds);
    const peerIds = Array.from(new Set((peers ?? []).map((p) => p.user_id)));
    query = query.in('id', peerIds);
  }

  if (auth.user.role === 'agent') {
    // Agents only see themselves.
    query = query.eq('id', auth.user.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data });
}
