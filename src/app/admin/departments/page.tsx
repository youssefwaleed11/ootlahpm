'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface Department {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  members_count: number;
  projects_count: number;
}

type DeptFormState = {
  id?: string;
  name: string;
  description: string;
  color: string;
  icon: string;
};

const EMPTY_FORM: DeptFormState = {
  name: '',
  description: '',
  color: '#ecd862',
  icon: '',
};

export default function DepartmentSettingsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<DeptFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (res.ok) setDepartments(data.departments || []);
      else toast.error(data.error || 'Could not load departments');
    } catch {
      toast.error('Network error while loading departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (d: Department) => {
    setForm({
      id: d.id,
      name: d.name,
      description: d.description ?? '',
      color: d.color || '#ecd862',
      icon: d.icon ?? '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch(
        isEdit ? `/api/departments/${form.id}` : '/api/departments',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
            color: form.color,
            icon: form.icon || null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Save failed');
        return;
      }
      toast.success(isEdit ? 'Department updated' : 'Department created');
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: Department) => {
    if (!window.confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    setDeletingId(d.id);
    try {
      const res = await fetch(`/api/departments/${d.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Delete failed');
        return;
      }
      toast.success('Department deleted');
      load();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout currentPath="/admin/departments">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-800 text-slate-900 mb-2">Departments</h1>
            <p className="text-slate-600">Add, edit, and remove company departments.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-600 text-[#0f0b05] bg-[#ecd862] hover:bg-[#f2cb50] transition-colors"
          >
            <Icon name="PlusIcon" size={18} />
            Add department
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-slate-600 mb-3">No departments yet.</p>
            <button
              onClick={openAdd}
              className="text-sm font-600 text-[#a3671d] hover:underline"
            >
              Create your first department
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dept.color }}
                    />
                    <div>
                      <h3 className="text-lg font-700 text-slate-900">{dept.name}</h3>
                      <p className="text-xs text-slate-500">{dept.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(dept)}
                      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                      aria-label={`Edit ${dept.name}`}
                    >
                      <Icon name="PencilIcon" size={16} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => remove(dept)}
                      disabled={deletingId === dept.id}
                      className="p-1.5 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                      aria-label={`Delete ${dept.name}`}
                    >
                      <Icon name="TrashIcon" size={16} className="text-rose-600" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 min-h-[2.5rem]">
                  {dept.description || 'No description'}
                </p>

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Members</span>
                    <span className="font-700 text-slate-900">{dept.members_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Projects</span>
                    <span className="font-700 text-slate-900">{dept.projects_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-800 text-slate-900 mb-4">
              {form.id ? 'Edit department' : 'Add department'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-slate-900 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862]"
                  placeholder="e.g. Paid Media"
                />
              </div>
              <div>
                <label className="block text-sm font-600 text-slate-900 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-600 text-slate-900 mb-1">Brand color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="h-10 w-14 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862] font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-600 text-slate-900 mb-1">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 focus:border-[#ecd862]"
                  placeholder="e.g. megaphone"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg font-600 text-[#0f0b05] bg-[#ecd862] hover:bg-[#f2cb50] disabled:opacity-60"
              >
                {saving ? 'Saving...' : form.id ? 'Save changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
