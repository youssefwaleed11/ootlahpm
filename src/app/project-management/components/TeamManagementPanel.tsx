'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { MOCK_TEAMS, MOCK_USERS, getUserById, type Team, type User } from '@/lib/mockData';
import { toast } from 'sonner';

interface TeamManagementPanelProps {
  onClose: () => void;
}

export default function TeamManagementPanel({ onClose }: TeamManagementPanelProps) {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [selectedTeam, setSelectedTeam] = useState<Team>(MOCK_TEAMS[0]);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const teamMembers = MOCK_USERS.filter(u => selectedTeam.memberIds.includes(u.id));
  const leader = getUserById(selectedTeam.leaderId);
  const nonMembers = MOCK_USERS.filter(u => !selectedTeam.memberIds.includes(u.id));

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    // BACKEND INTEGRATION: Supabase insert team
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      leaderId: 'user-001',
      memberIds: ['user-001'],
      projectIds: [],
      color: '#F97316',
      createdAt: new Date().toISOString(),
    };
    setTeams(prev => [...prev, newTeam]);
    setNewTeamName('');
    setCreatingTeam(false);
    toast.success(`Team "${newTeam.name}" created`);
  };

  const handleRemoveMember = (userId: string) => {
    if (userId === selectedTeam.leaderId) {
      toast.error('Cannot remove the team leader. Reassign leadership first.');
      return;
    }
    // BACKEND INTEGRATION: Supabase update team members
    setTeams(prev => prev.map(t => t.id === selectedTeam.id
      ? { ...t, memberIds: t.memberIds.filter(id => id !== userId) }
      : t
    ));
    setSelectedTeam(prev => ({ ...prev, memberIds: prev.memberIds.filter(id => id !== userId) }));
    toast.success('Member removed from team');
  };

  const handleAddMember = (userId: string) => {
    // BACKEND INTEGRATION: Supabase update team members + Resend email notification
    setTeams(prev => prev.map(t => t.id === selectedTeam.id
      ? { ...t, memberIds: [...t.memberIds, userId] }
      : t
    ));
    setSelectedTeam(prev => ({ ...prev, memberIds: [...prev.memberIds, userId] }));
    toast.success(`${getUserById(userId)?.name} added to team`);
  };

  const ROLE_BADGE: Record<User['role'], string> = {
    admin: 'bg-red-100 text-red-600',
    team_leader: 'bg-teal-100 text-teal-700',
    agent: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-modal w-full max-w-2xl max-h-[85vh] flex flex-col slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-teal/10 flex items-center justify-center">
              <Icon name="UserGroupIcon" size={16} className="text-brand-teal" />
            </div>
            <h2 className="text-base font-700 text-slate-800">Team Management</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Team list */}
          <div className="w-52 border-r border-slate-200 flex flex-col flex-shrink-0">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider">Teams</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 ${
                    selectedTeam.id === team.id ? 'bg-orange-50 border-r-2 border-brand-orange' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: team.color }}>
                    <Icon name="UserGroupIcon" size={13} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-600 text-slate-700 truncate">{team.name}</p>
                    <p className="text-[10px] text-slate-400">{team.memberIds.length} members</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100">
              {creatingTeam ? (
                <div className="space-y-2">
                  <input
                    autoFocus
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreateTeam(); if (e.key === 'Escape') setCreatingTeam(false); }}
                    placeholder="Team name..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  />
                  <div className="flex gap-1.5">
                    <button onClick={handleCreateTeam} className="flex-1 py-1 bg-brand-orange text-white text-xs font-600 rounded-lg hover:bg-brand-orange-dark transition-colors">
                      Create
                    </button>
                    <button onClick={() => setCreatingTeam(false)} className="flex-1 py-1 bg-slate-100 text-slate-600 text-xs font-600 rounded-lg hover:bg-slate-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setCreatingTeam(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-500 text-slate-500 hover:border-brand-orange hover:text-brand-orange transition-all duration-150"
                >
                  <Icon name="PlusIcon" size={13} />
                  New Team
                </button>
              )}
            </div>
          </div>

          {/* Team detail */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            {/* Team header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: selectedTeam.color }}>
                <Icon name="UserGroupIcon" size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-700 text-slate-800">{selectedTeam.name}</h3>
                <p className="text-xs text-slate-500">{teamMembers.length} members · {selectedTeam.projectIds.length} projects</p>
              </div>
            </div>

            {/* Team leader */}
            {leader && (
              <div>
                <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-2">Team Leader</p>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center">
                    <span className="text-white text-xs font-700">{leader.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-600 text-slate-800">{leader.name}</p>
                    <p className="text-[11px] text-slate-500">{leader.email}</p>
                  </div>
                  <span className="text-[10px] font-700 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">Leader</span>
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-2">Members ({teamMembers.length})</p>
              <div className="space-y-1.5">
                {teamMembers.map(member => (
                  <div key={`member-${member.id}`} className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 group">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-brand-orange/80 flex items-center justify-center">
                        <span className="text-white text-[10px] font-700">{member.avatar}</span>
                      </div>
                      {member.isOnline && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 text-slate-700 truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                    </div>
                    <span className={`text-[10px] font-600 px-1.5 py-0.5 rounded-full flex-shrink-0 ${ROLE_BADGE[member.role]}`}>
                      {member.role.replace('_', ' ')}
                    </span>
                    {member.id !== selectedTeam.leaderId && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from team"
                      >
                        <Icon name="XMarkIcon" size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add members */}
            {nonMembers.length > 0 && (
              <div>
                <p className="text-[10px] font-600 text-slate-400 uppercase tracking-wider mb-2">Add Members</p>
                <div className="space-y-1.5">
                  {nonMembers.map(user => (
                    <div key={`add-${user.id}`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-dashed border-slate-200 hover:border-brand-orange/40 hover:bg-orange-50/30 transition-all duration-150 group">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-slate-500 text-[10px] font-700">{user.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-600 text-slate-600 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleAddMember(user.id)}
                        className="flex items-center gap-1 text-[11px] font-600 text-brand-teal hover:text-brand-teal-dark transition-colors px-2 py-1 rounded-lg hover:bg-teal-50"
                      >
                        <Icon name="PlusIcon" size={12} />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}