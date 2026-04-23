import type { SupabaseClient } from '@supabase/supabase-js';

/** Write an entry to audit_logs. Never throws — logs and returns. */
export async function writeAudit(
  supabase: SupabaseClient,
  params: {
    organization_id: string;
    user_id: string | null;
    action: string;
    resource_type?: string;
    resource_id?: string;
    changes?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from('audit_logs').insert({
    organization_id: params.organization_id,
    user_id: params.user_id,
    action: params.action,
    resource_type: params.resource_type ?? null,
    resource_id: params.resource_id ?? null,
    changes: params.changes ?? null,
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[audit] failed to write log:', error.message);
  }
}
