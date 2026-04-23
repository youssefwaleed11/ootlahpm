import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserDepartmentIds } from '@/lib/auth/session';
import { writeAudit } from '@/lib/auth/audit';

const BUCKET = 'resources';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get('departmentId');

  let q = session.supabase
    .from('resources')
    .select(
      'id, department_id, title, description, file_url, file_type, file_name, file_size, tags, created_at, uploaded_by, uploader:users!resources_uploaded_by_fkey(id, full_name, avatar_url), department:departments(id, name, color)'
    )
    .eq('organization_id', session.user.organization_id)
    .order('created_at', { ascending: false });

  if (departmentId) q = q.eq('department_id', departmentId);
  else if (session.user.role !== 'admin') {
    const deptIds = await getUserDepartmentIds(session);
    if (deptIds.length === 0) return NextResponse.json({ resources: [] });
    q = q.in('department_id', deptIds);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resources: data ?? [] });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'agent') {
    return NextResponse.json(
      { error: 'Only admins and team leaders can upload resources.' },
      { status: 403 }
    );
  }

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const title = (form.get('title') as string | null) || file?.name;
  const description = (form.get('description') as string | null) || null;
  const departmentId = form.get('departmentId') as string | null;
  const tags =
    (form.get('tags') as string | null)
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  if (!departmentId) return NextResponse.json({ error: 'departmentId required.' }, { status: 400 });
  if (!title) return NextResponse.json({ error: 'title required.' }, { status: 400 });

  if (session.user.role === 'team_leader') {
    const deptIds = await getUserDepartmentIds(session);
    if (!deptIds.includes(departmentId)) {
      return NextResponse.json(
        { error: 'You can only upload to your own department.' },
        { status: 403 }
      );
    }
  }

  let file_url: string | null = null;
  let file_type: string | null = null;
  let file_name: string | null = null;
  let file_size: number | null = null;

  if (file instanceof File) {
    const safeName = file.name.replace(/[^\w.-]+/g, '_');
    const path = `${session.user.organization_id}/${departmentId}/${Date.now()}_${safeName}`;
    const { error: uploadErr } = await session.supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    const { data: pub } = session.supabase.storage.from(BUCKET).getPublicUrl(path);
    file_url = pub.publicUrl;
    file_type = file.type || null;
    file_name = file.name;
    file_size = file.size;
  }

  const { data: record, error } = await session.supabase
    .from('resources')
    .insert({
      organization_id: session.user.organization_id,
      department_id: departmentId,
      uploaded_by: session.user.id,
      title,
      description,
      file_url,
      file_type,
      file_name,
      file_size,
      tags,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'resource_uploaded',
    resource_type: 'resource',
    resource_id: record.id,
    changes: { title, departmentId },
  });

  return NextResponse.json({ resource: record }, { status: 201 });
}
