import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isSession, getUserDepartmentIds } from '@/lib/auth/session';
import type { UserRole } from '@/types/database';

export async function GET(request: NextRequest) {
  const session = await requireRole('admin', 'team_leader');
  if (!isSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') as UserRole | null;
  const departmentId = searchParams.get('departmentId');
  const search = searchParams.get('search');
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(100, Number(searchParams.get('limit') ?? 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = session.supabase
    .from('users')
    .select('id, email, full_name, avatar_url, role, is_active, position, created_at', {
      count: 'exact',
    })
    .eq('organization_id', session.user.organization_id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (role) q = q.eq('role', role);
  if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);

  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (deptIds.length === 0) {
      return NextResponse.json({
        users: [],
        pagination: { total: 0, page, limit, hasMore: false },
      });
    }
    const { data: members } = await session.supabase
      .from('department_members')
      .select('user_id')
      .in('department_id', deptIds);
    const memberIds = Array.from(new Set((members ?? []).map((m) => m.user_id as string)));
    if (memberIds.length === 0) {
      return NextResponse.json({
        users: [],
        pagination: { total: 0, page, limit, hasMore: false },
      });
    }
    q = q.in('id', memberIds);
    if (departmentId && !deptIds.includes(departmentId)) {
      return NextResponse.json({
        users: [],
        pagination: { total: 0, page, limit, hasMore: false },
      });
    }
  }

  if (departmentId) {
    const { data: members } = await session.supabase
      .from('department_members')
      .select('user_id')
      .eq('department_id', departmentId);
    const ids = (members ?? []).map((m) => m.user_id as string);
    if (ids.length === 0) {
      return NextResponse.json({
        users: [],
        pagination: { total: 0, page, limit, hasMore: false },
      });
    }
    q = q.in('id', ids);
  }

  const { data: users, error, count } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? users?.length ?? 0;
  return NextResponse.json({
    users: users ?? [],
    pagination: { total, page, limit, hasMore: from + (users?.length ?? 0) < total },
  });
}
