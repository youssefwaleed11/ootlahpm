'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'department_head' | 'team_member';
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function UserManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Layla Ahmed',
      email: 'layla@ootlah.com',
      role: 'admin',
      department: 'Executive',
      status: 'active',
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Omar Hassan',
      email: 'omar@ootlah.com',
      role: 'manager',
      department: 'Marketing',
      status: 'active',
      joinDate: '2024-02-01',
    },
    {
      id: '3',
      name: 'Nour Ibrahim',
      email: 'nour@ootlah.com',
      role: 'department_head',
      department: 'SEO',
      status: 'active',
      joinDate: '2024-02-15',
    },
    {
      id: '4',
      name: 'Sara Mohamed',
      email: 'sara@ootlah.com',
      role: 'team_member',
      department: 'Content',
      status: 'active',
      joinDate: '2024-03-01',
    },
    {
      id: '5',
      name: 'Youssef Ali',
      email: 'youssef@ootlah.com',
      role: 'team_member',
      department: 'Designers',
      status: 'inactive',
      joinDate: '2024-03-10',
    },
  ]);

  const filteredUsers = filterRole === 'all' ? users : users.filter((u) => u.role === filterRole);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'manager':
        return 'bg-orange-100 text-orange-700';
      case 'department_head':
        return 'bg-blue-100 text-blue-700';
      case 'team_member':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700';
  };

  return (
    <AppLayout currentPath="/admin/users">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-800 text-slate-900 mb-2">User Management</h1>
            <p className="text-slate-600">Manage team members and their roles and permissions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors"
          >
            <Icon name="PlusIcon" size={18} />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-600 text-slate-600 uppercase mb-2">Total Users</p>
            <p className="text-3xl font-800 text-slate-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-600 text-slate-600 uppercase mb-2">Active</p>
            <p className="text-3xl font-800 text-green-600">
              {users.filter((u) => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-600 text-slate-600 uppercase mb-2">Admins</p>
            <p className="text-3xl font-800 text-red-600">
              {users.filter((u) => u.role === 'admin').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-600 text-slate-600 uppercase mb-2">Departments</p>
            <p className="text-3xl font-800 text-blue-600">
              {new Set(users.map((u) => u.department)).size}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="w-full md:w-64">
          <label className="block text-sm font-600 text-slate-900 mb-2">Filter by Role</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="department_head">Department Head</option>
            <option value="team_member">Team Member</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 font-700 text-slate-900 text-sm">Name</th>
                  <th className="text-left py-4 px-6 font-700 text-slate-900 text-sm">Email</th>
                  <th className="text-left py-4 px-6 font-700 text-slate-900 text-sm">
                    Department
                  </th>
                  <th className="text-left py-4 px-6 font-700 text-slate-900 text-sm">Role</th>
                  <th className="text-left py-4 px-6 font-700 text-slate-900 text-sm">Status</th>
                  <th className="text-left py-4 px-6 font-700 text-slate-900 text-sm">Joined</th>
                  <th className="text-left py-4 px-6 font-700 text-slate-900 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-700 text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-600 text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{user.email}</td>
                    <td className="py-4 px-6 text-slate-900 font-600">{user.department}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-600 ${getRoleColor(user.role)}`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-600 ${getStatusColor(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                          <Icon name="PencilIcon" size={16} className="text-slate-600" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                          <Icon name="TrashIcon" size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6">
              <h2 className="text-2xl font-800 text-slate-900 mb-4">Add New User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Role</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option>Team Member</option>
                    <option>Department Head</option>
                    <option>Manager</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-600 text-slate-900 mb-2">Department</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option>Marketing</option>
                    <option>SEO</option>
                    <option>Content</option>
                    <option>BD</option>
                    <option>Designers</option>
                    <option>Social Media</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
