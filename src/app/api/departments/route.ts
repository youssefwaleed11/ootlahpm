import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export async function GET() {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('departments')
    .select('id, name, slug, description, color, icon, created_at, updated_at')
    .eq('organization_id', auth.user.organization_id)
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const deptIds = (data ?? []).map((d) => d.id);
  const { data: members } = await supabase
    .from('department_members')
    .select('department_id')
    .in('department_id', deptIds);

  const { data: projects } = await supabase
    .from('projects')
    .select('department_id')
    .in('department_id', deptIds);

  const memberCount = new Map<string, number>();
  (members ?? []).forEach((m) => {
    memberCount.set(m.department_id, (memberCount.get(m.department_id) ?? 0) + 1);
  });
  const projectCount = new Map<string, number>();
  (projects ?? []).forEach((p) => {
    projectCount.set(p.department_id, (projectCount.get(p.department_id) ?? 0) + 1);
  });

  const enriched = (data ?? []).map((d) => ({
    ...d,
    members_count: memberCount.get(d.id) ?? 0,
    projects_count: projectCount.get(d.id) ?? 0,
  }));

  return NextResponse.json({ departments: enriched });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(['admin']);
  if ('response' in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description : null;
  const color = typeof body.color === 'string' ? body.color : '#ecd862';
  const icon = typeof body.icon === 'string' ? body.icon : null;
  const slug = body.slug ? toSlug(body.slug) : toSlug(name);

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('departments')
    .insert({
      organization_id: auth.user.organization_id,
      name,
      slug,
      description,
      color,
      icon,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from('audit_logs').insert({
    organization_id: auth.user.organization_id,
    user_id: auth.user.id,
    action: 'department_created',
    resource_type: 'department',
    resource_id: data.id,
    changes: { name, slug },
  });

  return NextResponse.json({ department: data }, { status: 201 });
}
