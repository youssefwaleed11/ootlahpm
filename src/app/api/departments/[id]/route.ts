import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .eq('organization_id', auth.user.organization_id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: members } = await supabase
    .from('department_members')
    .select('id, role, position, joined_at, users(id, full_name, email, avatar_url, role)')
    .eq('department_id', id);

  return NextResponse.json({ department: data, members: members ?? [] });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireUser(['admin']);
  if ('response' in auth) return auth.response;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.name === 'string') patch.name = body.name.trim();
  if (typeof body.description === 'string') patch.description = body.description;
  if (typeof body.color === 'string') patch.color = body.color;
  if (typeof body.icon === 'string') patch.icon = body.icon;
  if (typeof body.slug === 'string') {
    patch.slug = body.slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('departments')
    .update(patch)
    .eq('id', id)
    .eq('organization_id', auth.user.organization_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from('audit_logs').insert({
    organization_id: auth.user.organization_id,
    user_id: auth.user.id,
    action: 'department_updated',
    resource_type: 'department',
    resource_id: id,
    changes: patch,
  });

  return NextResponse.json({ department: data });
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  const auth = await requireUser(['admin']);
  if ('response' in auth) return auth.response;
  const { id } = await params;

  const supabase = await createClient();

  // Guard: a department with live projects must be emptied first.
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', id);

  if ((projectsCount ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Cannot delete a department that still has projects. Reassign or archive them first.' },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)
    .eq('organization_id', auth.user.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from('audit_logs').insert({
    organization_id: auth.user.organization_id,
    user_id: auth.user.id,
    action: 'department_deleted',
    resource_type: 'department',
    resource_id: id,
  });

  return NextResponse.json({ ok: true });
}
