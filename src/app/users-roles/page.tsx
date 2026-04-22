'use client';

import React, { useState } from 'react';
import { MOCK_USERS, CURRENT_USER } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function UsersRolesPage() {
  const [users] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  if (CURRENT_USER.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Icon name="LockClosedIcon" size={48} className="text-slate-400 mb-3" />
        <h1 className="text-xl font-700 text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500">Only administrators can manage users and roles.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'team_leader': return 'bg-blue-100 text-blue-700';
      case 'agent': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'team_leader': return 'Team Leader';
      case 'agent': return 'Agent';
      default: return role;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-800 text-slate-900 mb-1">Users & Roles</h1>
              <p className="text-sm text-slate-600">Manage team members and their permissions</p>
            </div>
            <button className="px-4 py-2 bg-brand-orange text-white rounded-lg font-600 hover:bg-orange-600 transition-colors flex items-center gap-2">
              <Icon name="PlusIcon" size={18} />
              Add User
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-4 font-600 text-slate-700 text-sm">Name</th>
                  <th className="text-left px-6 py-4 font-600 text-slate-700 text-sm">Email</th>
                  <th className="text-left px-6 py-4 font-600 text-slate-700 text-sm">Role</th>
                  <th className="text-left px-6 py-4 font-600 text-slate-700 text-sm">Team</th>
                  <th className="text-left px-6 py-4 font-600 text-slate-700 text-sm">Status</th>
                  <th className="text-center px-6 py-4 font-600 text-slate-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} className={idx !== filteredUsers.length - 1 ? 'border-b border-slate-200' : ''}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-600 text-slate-700">
                          {user.avatar}
                        </div>
                        <span className="font-500 text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-600 ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {MOCK_USERS.find(u => u.teamId)?.teamId === user.teamId ? 'Team-' + user.teamId : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.isOnline ? '#10B981' : '#9CA3AF' }} />
                        <span className="text-sm text-slate-600">{user.isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-brand-orange hover:text-orange-600 font-600 text-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Icon name="UsersIcon" size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
