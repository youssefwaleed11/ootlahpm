import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createNotification } from '@/lib/auth/notifications';
import { writeAudit } from '@/lib/auth/audit';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const projectId = searchParams.get('projectId');

  if (!taskId && !projectId) {
    return NextResponse.json({ error: 'taskId or projectId is required.' }, { status: 400 });
  }

  let q = session.supabase
    .from('task_comments')
    .select(
      'id, content, mentions, task_id, project_id, created_at, updated_at, author:users(id, full_name, avatar_url)'
    )
    .order('created_at', { ascending: true });

  if (taskId) q = q.eq('task_id', taskId);
  if (projectId) q = q.eq('project_id', projectId);

  const { data: comments, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (comments ?? []).map((c) => c.id);
  const { data: attachments } = await session.supabase
    .from('attachments')
    .select('*')
    .in('comment_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

  const byComment = new Map<string, typeof attachments>();
  (attachments ?? []).forEach((a) => {
    const list = byComment.get(a.comment_id as string) ?? [];
    list.push(a);
    byComment.set(a.comment_id as string, list);
  });

  const enriched = (comments ?? []).map((c) => ({
    ...c,
    attachments: byComment.get(c.id) ?? [],
  }));

  return NextResponse.json({ comments: enriched });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    taskId?: string;
    projectId?: string;
    content?: string;
    attachmentIds?: string[];
  };

  if (!body.content || !body.content.trim()) {
    return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
  }
  if (!body.taskId && !body.projectId) {
    return NextResponse.json({ error: 'taskId or projectId is required.' }, { status: 400 });
  }

  // Extract @mentions (match usernames against full_name slug or email local part)
  const mentionMatches = Array.from(body.content.matchAll(/@([\w.-]+)/g)).map((m) => m[1]);
  let mentionedUserIds: string[] = [];
  if (mentionMatches.length > 0) {
    const { data: users } = await session.supabase
      .from('users')
      .select('id, full_name, email')
      .eq('organization_id', session.user.organization_id);
    const needles = mentionMatches.map((x) => x.toLowerCase());
    mentionedUserIds = (users ?? [])
      .filter((u) => {
        const nameSlug = (u.full_name ?? '').toLowerCase().replace(/\s+/g, '');
        const emailLocal = (u.email ?? '').split('@')[0].toLowerCase();
        return needles.some((n) => nameSlug.includes(n) || emailLocal === n);
      })
      .map((u) => u.id as string);
  }

  const { data: comment, error } = await session.supabase
    .from('task_comments')
    .insert({
      task_id: body.taskId ?? null,
      project_id: body.projectId ?? null,
      author_id: session.user.id,
      content: body.content,
      mentions: mentionedUserIds,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach any pre-uploaded attachments to this comment
  if (body.attachmentIds && body.attachmentIds.length > 0) {
    await session.supabase
      .from('attachments')
      .update({ comment_id: comment.id })
      .in('id', body.attachmentIds);
  }

  // Notify mentioned users
  for (const uid of mentionedUserIds) {
    await createNotification(session.supabase, {
      organization_id: session.user.organization_id,
      user_id: uid,
      from_user_id: session.user.id,
      type: 'mentioned',
      title: 'You were mentioned',
      body: body.content.slice(0, 200),
      task_id: body.taskId ?? null,
      project_id: body.projectId ?? null,
    });
  }

  // Notify task assignee when a new comment is posted
  if (body.taskId) {
    const { data: task } = await session.supabase
      .from('tasks')
      .select('assigned_to, title')
      .eq('id', body.taskId)
      .single();
    if (task?.assigned_to && !mentionedUserIds.includes(task.assigned_to)) {
      await createNotification(session.supabase, {
        organization_id: session.user.organization_id,
        user_id: task.assigned_to,
        from_user_id: session.user.id,
        type: 'comment_added',
        title: 'New comment on your task',
        body: body.content.slice(0, 200),
        task_id: body.taskId,
      });
    }
  }

  await writeAudit(session.supabase, {
    organization_id: session.user.organization_id,
    user_id: session.user.id,
    action: 'comment_added',
    resource_type: 'comment',
    resource_id: comment.id,
    changes: { taskId: body.taskId, projectId: body.projectId },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
