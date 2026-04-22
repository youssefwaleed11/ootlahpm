'use client';

import React from 'react';
import { CURRENT_USER, MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS, MOCK_TEAMS } from '@/lib/mockData';
import AdminDashboard from './components/AdminDashboard';
import TeamLeaderDashboard from './components/TeamLeaderDashboard';
import AgentDashboard from './components/AgentDashboard';

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-auto">
      {CURRENT_USER.role === 'admin' && <AdminDashboard />}
      {CURRENT_USER.role === 'team_leader' && <TeamLeaderDashboard />}
      {CURRENT_USER.role === 'agent' && <AgentDashboard />}
    </div>
  );
}
