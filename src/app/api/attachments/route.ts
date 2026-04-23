import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

const BUCKET = 'attachments';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  const taskId = (form.get('taskId') as string) || null;
  const projectId = (form.get('projectId') as string) || null;
  const commentId = (form.get('commentId') as string) || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^\w.-]+/g, '_');
  const scopeDir = taskId ?? projectId ?? 'generic';
  const path = `${session.user.organization_id}/${scopeDir}/${Date.now()}_${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await session.supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: pub } = session.supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: record, error } = await session.supabase
    .from('attachments')
    .insert({
      task_id: taskId,
      comment_id: commentId,
      file_name: file.name,
      file_url: pub.publicUrl,
      file_type: file.type || null,
      file_size: file.size,
      uploaded_by: session.user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (taskId) {
    const { data: task } = await session.supabase
      .from('tasks')
      .select('attachment_count')
      .eq('id', taskId)
      .single();
    await session.supabase
      .from('tasks')
      .update({ attachment_count: (task?.attachment_count ?? 0) + 1 })
      .eq('id', taskId);
  }

  return NextResponse.json({ attachment: record }, { status: 201 });
}
