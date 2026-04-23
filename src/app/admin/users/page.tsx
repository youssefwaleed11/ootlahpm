'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

type Role = 'admin' | 'team_leader' | 'agent';

interface ApiUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  position: string | null;
  is_active: boolean;
  created_at: string;
}

interface ApiDepartment {
  id: string;
  name: string;
  color: string;
}

interface Invitation {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  position: string | null;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expires_at: string;
  department: { id: string; name: string } | null;
  invite_url: string | null;
}

type InviteForm = {
  email: string;
  fullName: string;
  role: Role;
  departmentId: string;
  position: string;
};

const EMPTY_INVITE: InviteForm = {
  email: '',
  fullName: '',
  role: 'agent',
  departmentId: '',
  position: '',
};

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  team_leader: 'Team leader',
  agent: 'Agent',
};

const ROLE_BADGE: Record<Role, string> = {
  admin: 'bg-[#ecd862]/20 text-[#a3671d]',
  team_leader: 'bg-[#c3802d]/20 text-[#a3671d]',
  agent: 'bg-slate-200 text-slate-700',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<InviteForm>(EMPTY_INVITE);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, i, d] = await Promise.all([
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/invitations').then((r) => r.json()),
        fetch('/api/departments').then((r) => r.json()),
      ]);
      setUsers(u.users || []);
      setInvitations(i.invitations || []);
      setDepartments(d.departments || []);
    } catch {
      toast.error('Could not load users or invitations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitInvite = async () => {
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          fullName: form.fullName.trim() || null,
          role: form.role,
          departmentId: form.departmentId || null,
          position: form.position.trim() || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.error || 'Could not create invitation');
        return;
      }
      if (payload.invite_url) {
        try {
          await navigator.clipboard.writeText(payload.invite_url);
          toast.success('Invite link created and copied to clipboard.');
        } catch {
          toast.success('Invite link created.');
        }
      } else {
        toast.success('Invitation created');
      }
      setInviteOpen(false);
      setForm(EMPTY_INVITE);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async (id: string) => {
    if (!window.confirm('Revoke this invitation? The link will stop working immediately.')) return;
    const res = await fetch(`/api/invitations/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || 'Could not revoke invitation');
      return;
    }
    toast.success('Invitation revoked');
    load();
  };

  const copyLink = async (url: string | null) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied');
    } catch {
      toast.error('Could not access clipboard');
    }
  };

  return (
    <AppLayout currentPath="/admin/users">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-800 text-slate-900 mb-2">User management</h1>
            <p className="text-slate-600">
              Invite new team members to specific departments and positions. Only invited emails can sign in.
            </p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-600 text-[#0f0b05] bg-[#ecd862] hover:bg-[#f2cb50] transition-colors"
          >
            <Icon name="UserPlusIcon" size={18} />
            Invite user
          </button>
        </div>

        {/* Users */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-700 text-slate-900">Team members</h2>
            <span className="text-xs text-slate-500">{users.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-700 uppercase text-slate-500 bg-slate-50">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Position</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                )}
                {!loading &&
                  users.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="py-3 px-6 font-600 text-slate-900">
                        {u.full_name || '(no name)'}
                      </td>
                      <td className="py-3 px-6 text-slate-600">{u.email}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-600 ${ROLE_BADGE[u.role]}`}
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-600">{u.position || '—'}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-600 ${
                            u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-slate-600 text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pending invitations */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-700 text-slate-900">Pending invitations</h2>
            <span className="text-xs text-slate-500">{invitations.length} pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-700 uppercase text-slate-500 bg-slate-50">
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Position</th>
                  <th className="py-3 px-6">Expires</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && invitations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No pending invitations.
                    </td>
                  </tr>
                )}
                {invitations.map((inv) => (
                  <tr key={inv.id} className="border-t border-slate-100">
                    <td className="py-3 px-6 font-600 text-slate-900">{inv.email}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-600 ${ROLE_BADGE[inv.role]}`}
                      >
                        {ROLE_LABEL[inv.role]}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-600">{inv.department?.name || '—'}</td>
                    <td className="py-3 px-6 text-slate-600">{inv.position || '—'}</td>
                    <td className="py-3 px-6 text-slate-600 text-sm">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyLink(inv.invite_url)}
                          disabled={!inv.invite_url}
                          className="px-2 py-1 text-xs rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-40"
                        >
                          Copy link
                        </button>
                        <button
                          onClick={() => revoke(inv.id)}
                          className="px-2 py-1 text-xs rounded border border-rose-300 text-rose-700 hover:bg-rose-50"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-800 text-slate-900 mb-4">Invite a team member</h2>
            <p className="text-sm text-slate-500 mb-4">
              The invite link is single-use and expires after 7 days. Only the invited email can accept it.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-slate-900 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862]"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-600 text-slate-900 mb-1">
                  Full name (optional)
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862]"
                  >
                    <option value="agent">Agent</option>
                    <option value="team_leader">Team leader</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-1">Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862]"
                  >
                    <option value="">None</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-600 text-slate-900 mb-1">
                  Position in department
                </label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862]"
                  placeholder="e.g. Senior SEO Analyst"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Saved on the user&apos;s membership in the selected department.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setInviteOpen(false);
                  setForm(EMPTY_INVITE);
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitInvite}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg font-600 text-[#0f0b05] bg-[#ecd862] hover:bg-[#f2cb50] disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
