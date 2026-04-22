'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { MOCK_DEPARTMENTS, CURRENT_USER, MOCK_USERS } from '@/lib/mockData';
import type { Department } from '@/lib/mockData';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Department>>({});

  if (CURRENT_USER.role !== 'admin') {
    return (
      <AppLayout currentPath="/departments">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon name="ExclamationTriangleIcon" size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-600 text-slate-800">Access Denied</h2>
            <p className="text-slate-500 mt-2">Only admins can manage departments</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData(dept);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', color: '#3B82F6', memberIds: [] });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast.error('Department name is required');
      return;
    }

    if (editingDept) {
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, ...formData, updatedAt: new Date().toISOString() } : d));
      toast.success('Department updated successfully');
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: formData.name || '',
        description: formData.description || '',
        color: formData.color || '#3B82F6',
        headId: formData.headId,
        memberIds: formData.memberIds || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDepartments(prev => [...prev, newDept]);
      toast.success('Department created successfully');
    }
    setShowModal(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success('Department deleted');
    }
  };

  return (
    <AppLayout currentPath="/departments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-slate-800">Departments</h1>
            <p className="text-sm text-slate-500 mt-1">Manage company departments and team structure</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-600 rounded-lg transition-colors"
          >
            <Icon name="PlusIcon" size={18} />
            New Department
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => {
            const head = dept.headId ? MOCK_USERS.find(u => u.id === dept.headId) : null;
            const members = MOCK_USERS.filter(u => dept.memberIds.includes(u.id));

            return (
              <div key={dept.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                {/* Color indicator */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }} />
                    <div className="flex-1">
                      <h3 className="font-600 text-slate-800">{dept.name}</h3>
                      <p className="text-xs text-slate-500">{members.length} members</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Icon name="PencilIcon" size={16} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Icon name="TrashIcon" size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {dept.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{dept.description}</p>
                )}

                {/* Head */}
                {head && (
                  <div className="text-xs mb-3 pb-3 border-t border-slate-100 pt-3">
                    <p className="text-slate-500 mb-1">Head</p>
                    <p className="font-500 text-slate-700">{head.name}</p>
                  </div>
                )}

                {/* Members Avatars */}
                {members.length > 0 && (
                  <div className="flex items-center gap-1">
                    {members.slice(0, 4).map(member => (
                      <div key={member.id} className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-600 text-slate-700" title={member.name}>
                        {member.avatar}
                      </div>
                    ))}
                    {members.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-600 text-slate-700">
                        +{members.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-700 mb-4">{editingDept ? 'Edit Department' : 'New Department'}</h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-500 text-slate-700 mb-1">Department Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    placeholder="e.g., SEO"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-500 text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                    rows={3}
                    placeholder="Department description..."
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-500 text-slate-700 mb-1">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#3B82F6', '#EC4899', '#F97316', '#8B5CF6', '#10B981', '#06B6D4', '#0D9488'].map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Head */}
                <div>
                  <label className="block text-sm font-500 text-slate-700 mb-1">Department Head</label>
                  <select
                    value={formData.headId || ''}
                    onChange={(e) => setFormData({ ...formData, headId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  >
                    <option value="">Select head...</option>
                    {MOCK_USERS.filter(u => u.role !== 'agent').map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                {/* Members */}
                <div>
                  <label className="block text-sm font-500 text-slate-700 mb-2">Members</label>
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
                    {MOCK_USERS.map(user => (
                      <label key={user.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.memberIds?.includes(user.id) || false}
                          onChange={(e) => {
                            const ids = formData.memberIds || [];
                            setFormData({
                              ...formData,
                              memberIds: e.target.checked ? [...ids, user.id] : ids.filter(id => id !== user.id)
                            });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700">{user.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-600 transition-colors"
                  >
                    {editingDept ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
