'use client';

import React, { useState } from 'react';
import { MOCK_TEAMS, MOCK_USERS, CURRENT_USER } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function TeamManagementPage() {
  const [teams] = useState(MOCK_TEAMS);
  const [showAddTeam, setShowAddTeam] = useState(false);

  if (CURRENT_USER.role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Icon name="LockClosedIcon" size={48} className="text-slate-400 mb-3" />
        <h1 className="text-xl font-700 text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500">Only administrators can manage teams.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-800 text-slate-900 mb-1">Team Management</h1>
              <p className="text-sm text-slate-600">Manage departments and team members</p>
            </div>
            <button
              onClick={() => setShowAddTeam(!showAddTeam)}
              className="px-4 py-2 bg-brand-orange text-white rounded-lg font-600 hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Icon name="PlusIcon" size={18} />
              New Team
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map(team => {
              const teamMembers = MOCK_USERS.filter(u => team.memberIds.includes(u.id));
              return (
                <div key={team.id} className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-700 text-slate-900">{team.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: team.color }}>
                      <Icon name="UserGroupIcon" size={20} className="text-white" />
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2 mb-4">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-600 text-slate-700">
                          {member.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-500 text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role === 'team_leader' ? 'Team Leader' : 'Agent'}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.isOnline ? '#10B981' : '#9CA3AF' }} />
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <button className="flex-1 px-3 py-2 text-sm font-600 text-brand-orange border border-brand-orange rounded-lg hover:bg-orange-50 transition-colors">
                      <Icon name="PlusIcon" size={14} className="inline mr-1" />
                      Add Member
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm font-600 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
