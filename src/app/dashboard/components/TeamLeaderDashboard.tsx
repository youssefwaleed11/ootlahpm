'use client';

import React, { useMemo } from 'react';
import { CURRENT_USER, MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS, MOCK_TEAMS } from '@/lib/mockData';
import StatCard from './StatCard';
import ProjectOverviewCard from './ProjectOverviewCard';
import Icon from '@/components/ui/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TeamLeaderDashboard() {
  const currentTeam = MOCK_TEAMS.find(t => t.id === CURRENT_USER.teamId);
  
  const stats = useMemo(() => {
    const teamTasks = MOCK_TASKS.filter(t => t.teamId === CURRENT_USER.teamId);
    const overdueTasks = teamTasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== 'done';
    }).length;
    const inReviewTasks = teamTasks.filter(t => t.status === 'in_review').length;
    const completedThisWeek = teamTasks.filter(t => {
      const taskDate = new Date(t.updatedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return t.status === 'done' && taskDate > weekAgo;
    }).length;

    return {
      totalTasks: teamTasks.length,
      overdueTasks,
      inReviewTasks,
      completedThisWeek,
    };
  }, []);

  const teamProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => p.teamId === CURRENT_USER.teamId);
  }, []);

  const approvalQueue = useMemo(() => {
    return MOCK_TASKS.filter(
      t => t.status === 'in_review' && t.teamId === CURRENT_USER.teamId
    ).slice(0, 3).map(task => {
      const project = MOCK_PROJECTS.find(p => p.id === task.projectId);
      const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
      return { task, project, assignee };
    });
  }, []);

  const teamMemberLoad = useMemo(() => {
    const teamMembers = MOCK_USERS.filter(u => u.teamId === CURRENT_USER.teamId && u.role === 'agent');
    return teamMembers.map(member => {
      const memberTasks = MOCK_TASKS.filter(t => t.assigneeId === member.id && t.status !== 'done');
      return {
        name: member.name.split(' ')[0],
        tasks: memberTasks.length,
      };
    });
  }, []);

  return (
    <div className="w-full bg-brand-background p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Team Overview - {currentTeam?.name}</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Team Tasks"
          value={stats.totalTasks}
          icon="ClipboardDocumentListIcon"
          color="brand-orange"
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          icon="ExclamationTriangleIcon"
          color="red-500"
        />
        <StatCard
          label="Awaiting Review"
          value={stats.inReviewTasks}
          icon="ClipboardDocumentCheckIcon"
          color="blue-500"
        />
        <StatCard
          label="Completed This Week"
          value={stats.completedThisWeek}
          icon="CheckCircleIcon"
          color="green-500"
        />
      </div>

      {/* Approval Queue Preview */}
      {approvalQueue.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Approval Queue Preview</h2>
          <div className="space-y-3">
            {approvalQueue.map(({ task, project, assignee }) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{project?.name}</p>
                  {assignee && (
                    <p className="text-xs text-muted-foreground mt-1">by {assignee.name}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1">
                    <Icon name="CheckIcon" size={14} />
                    Approve
                  </button>
                  <button className="px-3 py-1.5 bg-amber-500 text-white rounded text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-1">
                    <Icon name="ArrowUturnLeftIcon" size={14} />
                    Changes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Team's Projects */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">My Team&apos;s Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamProjects.length > 0 ? (
            teamProjects.map(project => (
              <ProjectOverviewCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-muted-foreground">No projects assigned to your team yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Member Load */}
      {teamMemberLoad.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Team Member Workload</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamMemberLoad}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#ff6b35" name="Active Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
