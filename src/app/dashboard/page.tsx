'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { CURRENT_USER, MOCK_TASKS, MOCK_PROJECTS, MOCK_USERS, MOCK_TEAMS, getUserById, formatDate, isOverdue, type Task, type Project } from '@/lib/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-600',
};

function StatCard({ label, value, icon, color, sub }: { label: string; value: number | string; icon: string; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-800 text-slate-800">{value}</p>
        <p className="text-sm font-500 text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-brand-orange to-amber-400 transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────
function AdminDashboard() {
  const allTasks = MOCK_TASKS;
  const overdueTasks = allTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done');
  const activeProjects = MOCK_PROJECTS.filter(p => p.status === 'active');
  const totalMembers = MOCK_USERS.length;

  const recentActivity = [
    { id: 'a1', text: 'Layla approved "Design new onboarding flow wireframes"', time: '2h ago', type: 'approve' },
    { id: 'a2', text: 'Omar moved "Implement dark mode tokens" to In Review', time: '3h ago', type: 'move' },
    { id: 'a3', text: 'Nour commented on "Navigation redesign"', time: '4h ago', type: 'comment' },
    { id: 'a4', text: 'Sana created task "API documentation site"', time: '5h ago', type: 'create' },
    { id: 'a5', text: 'Faisal completed "Audit existing REST endpoints"', time: '1d ago', type: 'done' },
    { id: 'a6', text: 'Tariq started "Push notification permission flow"', time: '1d ago', type: 'move' },
    { id: 'a7', text: 'Ziad uploaded 5 attachments to "App store screenshots"', time: '2d ago', type: 'attach' },
    { id: 'a8', text: 'Rima submitted "Rate limiting middleware" for review', time: '2d ago', type: 'review' },
  ];

  const activityIcon: Record<string, string> = {
    approve: 'CheckCircleIcon', move: 'ArrowRightCircleIcon', comment: 'ChatBubbleLeftIcon',
    create: 'PlusCircleIcon', done: 'CheckBadgeIcon', attach: 'PaperClipIcon', review: 'ClipboardDocumentCheckIcon',
  };

  const teamPerformance = MOCK_TEAMS.map(team => {
    const teamTasks = allTasks.filter(t => t.teamId === team.id);
    const done = teamTasks.filter(t => t.status === 'done').length;
    const rate = teamTasks.length > 0 ? Math.round((done / teamTasks.length) * 100) : 0;
    return { team, total: teamTasks.length, done, rate };
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={allTasks.length} icon="ClipboardDocumentListIcon" color="bg-brand-orange" />
        <StatCard label="Overdue Tasks" value={overdueTasks.length} icon="ExclamationCircleIcon" color="bg-red-500" />
        <StatCard label="Active Projects" value={activeProjects.length} icon="FolderOpenIcon" color="bg-brand-teal" />
        <StatCard label="Team Members" value={totalMembers} icon="UserGroupIcon" color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* All Projects Overview */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="text-base font-700 text-slate-800 mb-4">All Projects Overview</h3>
          <div className="space-y-4">
            {MOCK_PROJECTS.filter(p => p.status !== 'archived').map(project => (
              <div key={project.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-600 text-slate-700 truncate">{project.name}</p>
                    <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${PRIORITY_COLORS[project.priority]}`}>{project.priority}</span>
                  </div>
                  <ProgressBar value={project.progress} />
                  <p className="text-[11px] text-slate-400 mt-1">{project.completedTaskCount}/{project.taskCount} tasks · Due {formatDate(project.dueDate)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-800 text-brand-orange">{project.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="text-base font-700 text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={activityIcon[a.type] as Parameters<typeof Icon>[0]['name']} size={12} className="text-brand-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 leading-snug">{a.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="text-base font-700 text-slate-800 mb-4">Department Performance</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] font-600 text-slate-400 uppercase pb-2">Team</th>
                <th className="text-center text-[11px] font-600 text-slate-400 uppercase pb-2">Total</th>
                <th className="text-center text-[11px] font-600 text-slate-400 uppercase pb-2">Done</th>
                <th className="text-right text-[11px] font-600 text-slate-400 uppercase pb-2">Rate</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map(({ team, total, done, rate }) => (
                <tr key={team.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: team.color }} />
                      <span className="text-sm font-500 text-slate-700">{team.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-sm text-slate-600">{total}</td>
                  <td className="py-3 text-center text-sm text-slate-600">{done}</td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-700 ${rate >= 70 ? 'text-emerald-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>{rate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Overdue Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="text-base font-700 text-slate-800 mb-4 flex items-center gap-2">
            Overdue Alerts
            <span className="bg-red-100 text-red-600 text-[11px] font-700 px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
          </h3>
          {overdueTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon name="CheckCircleIcon" size={32} className="text-emerald-400 mb-2" />
              <p className="text-sm text-slate-500">No overdue tasks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map(task => {
                const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
                const project = MOCK_PROJECTS.find(p => p.id === task.projectId);
                return (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600 text-slate-700 truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{project?.name} · Due {formatDate(task.dueDate)}</p>
                    </div>
                    {assignee && (
                      <div className="w-6 h-6 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0" title={assignee.name}>
                        <span className="text-white text-[9px] font-700">{assignee.avatar}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TEAM LEADER DASHBOARD ──────────────────────────────────────────────────
function TeamLeaderDashboard() {
  const user = CURRENT_USER;
  const myTeam = MOCK_TEAMS.find(t => t.leaderId === user.id);
  const teamTasks = myTeam ? MOCK_TASKS.filter(t => t.teamId === myTeam.id) : [];
  const overdueTasks = teamTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done');
  const inReviewTasks = teamTasks.filter(t => t.status === 'in_review');
  const doneThisWeek = teamTasks.filter(t => t.status === 'done').length;
  const teamProjects = myTeam ? MOCK_PROJECTS.filter(p => p.teamId === myTeam.id) : [];

  const memberLoad = myTeam
    ? myTeam.memberIds.map(uid => {
        const member = getUserById(uid);
        const count = teamTasks.filter(t => t.assigneeId === uid && t.status !== 'done').length;
        return { name: member?.name.split(' ')[0] || uid, count };
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Tasks" value={teamTasks.length} icon="ClipboardDocumentListIcon" color="bg-brand-orange" />
        <StatCard label="Overdue" value={overdueTasks.length} icon="ExclamationCircleIcon" color="bg-red-500" />
        <StatCard label="In Review" value={inReviewTasks.length} icon="ClipboardDocumentCheckIcon" color="bg-amber-500" />
        <StatCard label="Done This Week" value={doneThisWeek} icon="CheckBadgeIcon" color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Approval Queue Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-700 text-slate-800">Approval Queue Preview</h3>
            <span className="bg-amber-100 text-amber-700 text-[11px] font-700 px-2 py-0.5 rounded-full">{inReviewTasks.length} pending</span>
          </div>
          {inReviewTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon name="CheckCircleIcon" size={32} className="text-emerald-400 mb-2" />
              <p className="text-sm text-slate-500">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inReviewTasks.slice(0, 3).map(task => {
                const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600 text-slate-700 truncate">{task.title}</p>
                      {assignee && <p className="text-[11px] text-slate-500 mt-0.5">by {assignee.name}</p>}
                    </div>
                    <div className="flex gap-1.5">
                      <button className="px-2.5 py-1 bg-emerald-500 text-white text-[11px] font-600 rounded-lg hover:bg-emerald-600 transition-colors">✓ Approve</button>
                      <button className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-600 rounded-lg hover:bg-amber-200 transition-colors">↩ Changes</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team Member Load */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="text-base font-700 text-slate-800 mb-4">Team Member Load</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={memberLoad} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} name="Active Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* My Team's Projects */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
        <h3 className="text-base font-700 text-slate-800 mb-4">My Team&apos;s Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamProjects.map(project => (
            <div key={project.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-700 text-slate-700">{project.name}</p>
                <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{project.status}</span>
              </div>
              <ProgressBar value={project.progress} />
              <p className="text-[11px] text-slate-400 mt-1.5">{project.completedTaskCount}/{project.taskCount} tasks · {project.progress}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AGENT DASHBOARD ────────────────────────────────────────────────────────
function AgentDashboard() {
  const user = CURRENT_USER;
  const myTasks = MOCK_TASKS.filter(t => t.assigneeId === user.id);
  const overdueTasks = myTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done');
  const completedThisWeek = myTasks.filter(t => t.status === 'done').length;
  const inProgress = myTasks.filter(t => t.status === 'in_progress').length;
  const todayTasks = myTasks.filter(t => t.status !== 'done' && (isOverdue(t.dueDate) || t.dueDate === '2026-04-21'));
  const myProjects = MOCK_PROJECTS.filter(p => myTasks.some(t => t.projectId === p.id));

  const weeklyData = [
    { day: 'Mon', completed: 2 }, { day: 'Tue', completed: 1 }, { day: 'Wed', completed: 3 },
    { day: 'Thu', completed: 0 }, { day: 'Fri', completed: 2 }, { day: 'Sat', completed: 1 }, { day: 'Sun', completed: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Tasks" value={myTasks.length} icon="ClipboardDocumentListIcon" color="bg-brand-orange" />
        <StatCard label="Overdue" value={overdueTasks.length} icon="ExclamationCircleIcon" color="bg-red-500" />
        <StatCard label="Completed" value={completedThisWeek} icon="CheckBadgeIcon" color="bg-emerald-500" />
        <StatCard label="In Progress" value={inProgress} icon="ArrowPathIcon" color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* My Tasks Today */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="text-base font-700 text-slate-800 mb-4">My Tasks Today</h3>
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon name="CheckCircleIcon" size={32} className="text-emerald-400 mb-2" />
              <p className="text-sm text-slate-500">No tasks due today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => {
                const overdue = isOverdue(task.dueDate);
                const project = MOCK_PROJECTS.find(p => p.id === task.projectId);
                return (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border ${overdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${overdue ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600 text-slate-700 truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{project?.name} · Due {formatDate(task.dueDate)}</p>
                    </div>
                    <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Personal Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          <h3 className="text-base font-700 text-slate-800 mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="completed" fill="#0D9488" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* My Projects */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
        <h3 className="text-base font-700 text-slate-800 mb-4">My Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {myProjects.map(project => (
            <div key={project.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-700 text-slate-700 mb-2">{project.name}</p>
              <ProgressBar value={project.progress} />
              <p className="text-[11px] text-slate-400 mt-1.5">{project.progress}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD PAGE ────────────────────────────────────────────────────
export default function DashboardPage() {
  const role = CURRENT_USER.role;

  const roleLabel: Record<string, string> = {
    admin: 'Admin Overview',
    team_leader: 'Team Leader Dashboard',
    agent: 'My Dashboard',
  };

  const greetings: Record<string, string> = {
    admin: 'Here\'s what\'s happening across your organization.',
    team_leader: 'Here\'s your team\'s current status.',
    agent: 'Here\'s your personal task overview.',
  };

  return (
    <AppLayout currentPath="/dashboard">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-800 text-slate-800">{roleLabel[role]}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{greetings[role]}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-card">
            <Icon name="CalendarDaysIcon" size={14} className="text-brand-orange" />
            <span className="font-500">April 21, 2026</span>
          </div>
        </div>

        {role === 'admin' && <AdminDashboard />}
        {role === 'team_leader' && <TeamLeaderDashboard />}
        {role === 'agent' && <AgentDashboard />}
      </div>
    </AppLayout>
  );
}
