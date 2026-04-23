import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationType } from '@/types/database';

export async function createNotification(
  supabase: SupabaseClient,
  params: {
    organization_id: string;
    user_id: string;
    from_user_id?: string | null;
    type: NotificationType;
    title: string;
    body?: string | null;
    task_id?: string | null;
    project_id?: string | null;
  }
) {
  if (params.from_user_id && params.from_user_id === params.user_id) {
    // Never notify yourself about your own actions
    return;
  }

  const { error } = await supabase.from('notifications').insert({
    organization_id: params.organization_id,
    user_id: params.user_id,
    from_user_id: params.from_user_id ?? null,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    task_id: params.task_id ?? null,
    project_id: params.project_id ?? null,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[notifications] failed:', error.message);
  }
}

export async function notifyMany(
  supabase: SupabaseClient,
  userIds: string[],
  base: Omit<Parameters<typeof createNotification>[1], 'user_id'>
) {
  await Promise.all(
    Array.from(new Set(userIds))
      .filter(Boolean)
      .map((uid) => createNotification(supabase, { ...base, user_id: uid }))
  );
}
