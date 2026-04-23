import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole, isSession } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await session.supabase
    .from('departments')
    .select('id, name, slug, description, color, icon, created_at')
    .eq('organization_id', session.user.organization_id)
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with member and project counts
  const enriched = await Promise.all(
    (data ?? []).map(async (d) => {
      const [{ count: memberCount }, { count: projectCount }] = await Promise.all([
        session.supabase
          .from('department_members')
          .select('id', { count: 'exact', head: true })
          .eq('department_id', d.id),
        session.supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('department_id', d.id),
      ]);
      return {
        ...d,
        member_count: memberCount ?? 0,
        project_count: projectCount ?? 0,
      };
    })
  );

  return NextResponse.json({ departments: enriched });
}

export async function POST(request: NextRequest) {
  const session = await requireRole('admin');
  if (!isSession(session)) return session;

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  };

  if (!body.name || body.name.trim().length < 2) {
    return NextResponse.json(
      { error: 'Department name must be at least 2 characters.' },
      { status: 400 }
    );
  }

  const slug = slugify(body.name);

  const { data, error } = await session.supabase
    .from('departments')
    .insert({
      organization_id: session.user.organization_id,
      name: body.name.trim(),
      slug,
      description: body.description ?? null,
      color: body.color ?? '#ecd862',
      icon: body.icon ?? null,
    })
    .select()
    .single();

  if (error) {
    const msg =
      error.code === '23505' ? 'A department with this name already exists.' : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'department_created',
    resource_type: 'department',
    resource_id: data.id,
    changes: { name: data.name },
  });

  return NextResponse.json({ department: data }, { status: 201 });
}
