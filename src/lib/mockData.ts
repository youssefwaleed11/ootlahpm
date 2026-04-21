// BACKEND INTEGRATION: Replace all mock data with Supabase queries
// Supabase tables: users, projects, tasks, teams, team_members, comments, notifications, messages

export type UserRole = 'admin' | 'team_leader' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  teamId?: string;
  isOnline: boolean;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  projectIds: string[];
  color: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'on_hold';
  teamId: string;
  adminId: string;
  startDate: string;
  dueDate: string;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  teamId?: string;
  assigneeId?: string;
  reporterId: string;
  startDate: string;
  dueDate: string;
  tags: string[];
  attachmentCount: number;
  commentCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_updated' | 'task_overdue' | 'comment_added' | 'project_created' | 'team_invite';
  title: string;
  body: string;
  taskId?: string;
  projectId?: string;
  isRead: boolean;
  createdAt: string;
}

export const MOCK_USERS: User[] = [
  { id: 'user-001', name: 'Layla Al-Rashidi', email: 'layla@ootlah.com', role: 'admin', avatar: 'LA', teamId: 'team-001', isOnline: true, joinedAt: '2025-01-15' },
  { id: 'user-002', name: 'Omar Khalid', email: 'omar@ootlah.com', role: 'team_leader', avatar: 'OK', teamId: 'team-001', isOnline: true, joinedAt: '2025-02-01' },
  { id: 'user-003', name: 'Nour Haddad', email: 'nour@ootlah.com', role: 'agent', avatar: 'NH', teamId: 'team-001', isOnline: false, joinedAt: '2025-02-10' },
  { id: 'user-004', name: 'Tariq Mansour', email: 'tariq@ootlah.com', role: 'agent', avatar: 'TM', teamId: 'team-001', isOnline: true, joinedAt: '2025-02-15' },
  { id: 'user-005', name: 'Sana Yousef', email: 'sana@ootlah.com', role: 'team_leader', avatar: 'SY', teamId: 'team-002', isOnline: false, joinedAt: '2025-03-01' },
  { id: 'user-006', name: 'Faisal Al-Amri', email: 'faisal@ootlah.com', role: 'agent', avatar: 'FA', teamId: 'team-002', isOnline: true, joinedAt: '2025-03-05' },
  { id: 'user-007', name: 'Rima Barakat', email: 'rima@ootlah.com', role: 'agent', avatar: 'RB', teamId: 'team-002', isOnline: false, joinedAt: '2025-03-12' },
  { id: 'user-008', name: 'Ziad Najjar', email: 'ziad@ootlah.com', role: 'agent', avatar: 'ZN', teamId: 'team-001', isOnline: true, joinedAt: '2025-03-20' },
];

export const MOCK_TEAMS: Team[] = [
  { id: 'team-001', name: 'Product & Design', leaderId: 'user-002', memberIds: ['user-002', 'user-003', 'user-004', 'user-008'], projectIds: ['proj-001', 'proj-003'], color: '#F97316', createdAt: '2025-01-20' },
  { id: 'team-002', name: 'Engineering', leaderId: 'user-005', memberIds: ['user-005', 'user-006', 'user-007'], projectIds: ['proj-002', 'proj-004'], color: '#0D9488', createdAt: '2025-02-05' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-001', name: 'Ootlah Mobile App v2', description: 'Complete redesign of the Ootlah mobile application with new onboarding flow, improved navigation, and dark mode support.', status: 'active', teamId: 'team-001', adminId: 'user-001', startDate: '2026-02-01', dueDate: '2026-05-30', progress: 64, priority: 'high', tags: ['mobile', 'design', 'UX'], taskCount: 24, completedTaskCount: 15, createdAt: '2026-01-28' },
  { id: 'proj-002', name: 'API Gateway Refactor', description: 'Migrate legacy REST endpoints to GraphQL, improve response times, and implement rate limiting across all services.', status: 'active', teamId: 'team-002', adminId: 'user-001', startDate: '2026-03-01', dueDate: '2026-06-15', progress: 38, priority: 'critical', tags: ['backend', 'API', 'performance'], taskCount: 18, completedTaskCount: 7, createdAt: '2026-02-25' },
  { id: 'proj-003', name: 'Brand Identity Refresh', description: 'Update brand guidelines, create new asset library, and roll out refreshed identity across all touchpoints.', status: 'active', teamId: 'team-001', adminId: 'user-001', startDate: '2026-03-15', dueDate: '2026-04-30', progress: 82, priority: 'medium', tags: ['branding', 'design'], taskCount: 12, completedTaskCount: 10, createdAt: '2026-03-10' },
  { id: 'proj-004', name: 'Analytics Dashboard', description: 'Build real-time analytics dashboard for internal teams to monitor KPIs, user engagement, and system health.', status: 'on_hold', teamId: 'team-002', adminId: 'user-001', startDate: '2026-04-01', dueDate: '2026-07-01', progress: 12, priority: 'medium', tags: ['analytics', 'frontend'], taskCount: 20, completedTaskCount: 2, createdAt: '2026-03-28' },
  { id: 'proj-005', name: 'Q1 Marketing Campaign', description: 'Coordinate all Q1 marketing deliverables including social media assets, email campaigns, and landing pages.', status: 'archived', teamId: 'team-001', adminId: 'user-001', startDate: '2026-01-01', dueDate: '2026-03-31', progress: 100, priority: 'low', tags: ['marketing', 'content'], taskCount: 16, completedTaskCount: 16, createdAt: '2025-12-20' },
];

export const MOCK_TASKS: Task[] = [
  // proj-001 tasks
  { id: 'task-001', title: 'Design new onboarding flow wireframes', description: 'Create low-fidelity wireframes for the 5-step onboarding flow. Cover account setup, team invite, first project creation, and tutorial overlay.', status: 'done', priority: 'high', projectId: 'proj-001', teamId: 'team-001', assigneeId: 'user-003', reporterId: 'user-002', startDate: '2026-02-05', dueDate: '2026-02-20', tags: ['wireframe', 'UX'], attachmentCount: 3, commentCount: 7, order: 0, createdAt: '2026-02-01', updatedAt: '2026-02-18' },
  { id: 'task-002', title: 'Implement dark mode tokens', description: 'Set up design token system for dark mode. Define all color variables and ensure every component respects the theme switch.', status: 'in_review', priority: 'medium', projectId: 'proj-001', teamId: 'team-001', assigneeId: 'user-004', reporterId: 'user-002', startDate: '2026-02-20', dueDate: '2026-03-10', tags: ['tokens', 'design-system'], attachmentCount: 1, commentCount: 4, order: 0, createdAt: '2026-02-18', updatedAt: '2026-03-08' },
  { id: 'task-003', title: 'Navigation redesign — bottom tab bar', description: 'Redesign the bottom navigation with 5 main tabs. Include icon + label treatment, active states, and notification badges.', status: 'in_progress', priority: 'high', projectId: 'proj-001', teamId: 'team-001', assigneeId: 'user-003', reporterId: 'user-002', startDate: '2026-03-01', dueDate: '2026-03-25', tags: ['navigation', 'mobile'], attachmentCount: 2, commentCount: 3, order: 0, createdAt: '2026-02-28', updatedAt: '2026-03-15' },
  { id: 'task-004', title: 'Profile screen UI update', description: 'Update the user profile screen with new avatar upload, bio field, and linked accounts section.', status: 'todo', priority: 'low', projectId: 'proj-001', teamId: 'team-001', assigneeId: 'user-008', reporterId: 'user-002', startDate: '2026-03-20', dueDate: '2026-04-10', tags: ['profile', 'UI'], attachmentCount: 0, commentCount: 1, order: 0, createdAt: '2026-03-15', updatedAt: '2026-03-15' },
  { id: 'task-005', title: 'Push notification permission flow', description: 'Design and implement the permission request flow for push notifications. Include rationale screen and fallback for denied state.', status: 'todo', priority: 'medium', projectId: 'proj-001', teamId: 'team-001', assigneeId: 'user-004', reporterId: 'user-002', startDate: '2026-04-01', dueDate: '2026-04-20', tags: ['notifications', 'UX'], attachmentCount: 0, commentCount: 0, order: 1, createdAt: '2026-03-28', updatedAt: '2026-03-28' },
  { id: 'task-006', title: 'App store screenshots', description: 'Create 8 App Store and Play Store screenshots showcasing key features. Include device frames and localized copy.', status: 'in_progress', priority: 'medium', projectId: 'proj-001', teamId: 'team-001', assigneeId: 'user-008', reporterId: 'user-001', startDate: '2026-04-05', dueDate: '2026-04-25', tags: ['marketing', 'assets'], attachmentCount: 5, commentCount: 2, order: 1, createdAt: '2026-04-02', updatedAt: '2026-04-10' },
  // proj-002 tasks
  { id: 'task-007', title: 'Audit existing REST endpoints', description: 'Document all 47 existing REST endpoints, their usage frequency, response shapes, and deprecation candidates.', status: 'done', priority: 'critical', projectId: 'proj-002', teamId: 'team-002', assigneeId: 'user-006', reporterId: 'user-005', startDate: '2026-03-05', dueDate: '2026-03-20', tags: ['audit', 'API'], attachmentCount: 2, commentCount: 9, order: 0, createdAt: '2026-03-01', updatedAt: '2026-03-19' },
  { id: 'task-008', title: 'GraphQL schema design', description: 'Design the GraphQL schema covering all core entities. Define types, queries, mutations, and subscriptions.', status: 'in_review', priority: 'critical', projectId: 'proj-002', teamId: 'team-002', assigneeId: 'user-005', reporterId: 'user-001', startDate: '2026-03-18', dueDate: '2026-04-05', tags: ['GraphQL', 'schema'], attachmentCount: 3, commentCount: 12, order: 0, createdAt: '2026-03-15', updatedAt: '2026-04-01' },
  { id: 'task-009', title: 'Rate limiting middleware', description: 'Implement sliding window rate limiting at the API gateway level. Configure per-user and per-IP limits.', status: 'in_progress', priority: 'high', projectId: 'proj-002', teamId: 'team-002', assigneeId: 'user-007', reporterId: 'user-005', startDate: '2026-04-01', dueDate: '2026-04-22', tags: ['security', 'middleware'], attachmentCount: 0, commentCount: 3, order: 0, createdAt: '2026-03-28', updatedAt: '2026-04-12' },
  { id: 'task-010', title: 'Migrate /users endpoints to GraphQL', description: 'Migrate all user-related REST endpoints to GraphQL resolvers. Maintain backward compatibility during transition.', status: 'todo', priority: 'high', projectId: 'proj-002', teamId: 'team-002', assigneeId: 'user-006', reporterId: 'user-005', startDate: '2026-04-10', dueDate: '2026-05-01', tags: ['migration', 'users'], attachmentCount: 0, commentCount: 1, order: 0, createdAt: '2026-04-05', updatedAt: '2026-04-05' },
  { id: 'task-011', title: 'Performance benchmarking setup', description: 'Set up k6 load testing scripts and baseline benchmarks for all critical endpoints before and after migration.', status: 'todo', priority: 'medium', projectId: 'proj-002', teamId: 'team-002', assigneeId: 'user-007', reporterId: 'user-005', startDate: '2026-04-15', dueDate: '2026-05-10', tags: ['performance', 'testing'], attachmentCount: 0, commentCount: 0, order: 1, createdAt: '2026-04-10', updatedAt: '2026-04-10' },
];

export const MOCK_COMMENTS: Comment[] = [
  { id: 'cmt-001', taskId: 'task-003', userId: 'user-002', content: 'Great progress on the tab bar! Can you also check if the active icon animation feels snappy enough on Android?', createdAt: '2026-03-16T09:30:00Z', isEdited: false },
  { id: 'cmt-002', taskId: 'task-003', userId: 'user-003', content: 'Yes, tested on a Pixel 7 — the animation is 200ms ease-out which feels good. Will also test on Samsung devices this afternoon.', createdAt: '2026-03-16T10:15:00Z', isEdited: false },
  { id: 'cmt-003', taskId: 'task-003', userId: 'user-004', content: 'I can help with the notification badge styling once the base tab bar is locked in. Just ping me when ready.', createdAt: '2026-03-16T11:00:00Z', isEdited: false },
  { id: 'cmt-004', taskId: 'task-003', userId: 'user-002', content: 'Sounds good. Target to have this in review by Thursday EOD. @Nour please share the Figma link when updated.', createdAt: '2026-03-17T08:45:00Z', isEdited: true },
  { id: 'cmt-005', taskId: 'task-008', userId: 'user-005', content: 'Schema looks solid. One concern — the nested resolver for team members could cause N+1 issues. Suggest adding DataLoader.', createdAt: '2026-04-02T14:20:00Z', isEdited: false },
  { id: 'cmt-006', taskId: 'task-008', userId: 'user-001', content: 'Agreed with Sana. DataLoader is a must before we go to production. Can we add that as a sub-task?', createdAt: '2026-04-02T15:00:00Z', isEdited: false },
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'msg-001', channelId: 'team-001', userId: 'user-002', content: 'Morning team! Quick reminder — design review for the mobile app is at 3pm today. Please have your screens ready.', createdAt: '2026-04-21T08:00:00Z', isRead: true },
  { id: 'msg-002', channelId: 'team-001', userId: 'user-003', content: 'Got it! I\'ll have the onboarding flow screens ready. Just finishing up the last two states.', createdAt: '2026-04-21T08:15:00Z', isRead: true },
  { id: 'msg-003', channelId: 'team-001', userId: 'user-004', content: 'Dark mode tokens are all done — pushed to Figma. Let me know if the naming convention looks off.', createdAt: '2026-04-21T09:00:00Z', isRead: true },
  { id: 'msg-004', channelId: 'team-001', userId: 'user-008', content: 'App store screenshots are looking great. Using the new brand colors and it pops 🔥', createdAt: '2026-04-21T10:30:00Z', isRead: false },
  { id: 'msg-005', channelId: 'team-001', userId: 'user-002', content: 'Nice work Ziad! Make sure we have both light and dark versions for the Play Store.', createdAt: '2026-04-21T11:00:00Z', isRead: false },
  { id: 'msg-006', channelId: 'team-002', userId: 'user-005', content: 'Rate limiting PR is up for review. @Rima please take a look when you get a chance.', createdAt: '2026-04-21T09:30:00Z', isRead: true },
  { id: 'msg-007', channelId: 'team-002', userId: 'user-007', content: 'On it! Will review before lunch.', createdAt: '2026-04-21T09:45:00Z', isRead: true },
  { id: 'msg-008', channelId: 'team-002', userId: 'user-006', content: 'GraphQL migration for /users is going to take longer than estimated. The legacy auth middleware is tightly coupled. Need to discuss.', createdAt: '2026-04-21T13:00:00Z', isRead: false },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', userId: 'user-003', type: 'task_assigned', title: 'New task assigned', body: 'You were assigned to "Navigation redesign — bottom tab bar" by Omar Khalid', taskId: 'task-003', isRead: false, createdAt: '2026-03-01T09:00:00Z' },
  { id: 'notif-002', userId: 'user-003', type: 'comment_added', title: 'New comment on your task', body: 'Omar Khalid commented on "Navigation redesign — bottom tab bar"', taskId: 'task-003', isRead: false, createdAt: '2026-03-17T08:45:00Z' },
  { id: 'notif-003', userId: 'user-004', type: 'task_overdue', title: 'Task overdue', body: '"Dark mode tokens" was due on Mar 10 — please update the status', taskId: 'task-002', isRead: false, createdAt: '2026-03-11T08:00:00Z' },
  { id: 'notif-004', userId: 'user-001', type: 'project_created', title: 'Project milestone reached', body: 'Brand Identity Refresh is 82% complete — on track to finish early', projectId: 'proj-003', isRead: true, createdAt: '2026-04-15T10:00:00Z' },
  { id: 'notif-005', userId: 'user-006', type: 'task_updated', title: 'Task status changed', body: '"Migrate /users endpoints" has been moved to In Progress by Sana Yousef', taskId: 'task-010', isRead: false, createdAt: '2026-04-18T14:30:00Z' },
];

export const CURRENT_USER = MOCK_USERS[0]; // Layla Al-Rashidi (admin)

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find(u => u.id === id);
}

export function getTeamById(id: string): Team | undefined {
  return MOCK_TEAMS.find(t => t.id === id);
}

export function getProjectById(id: string): Project | undefined {
  return MOCK_PROJECTS.find(p => p.id === id);
}

export function getTasksByProject(projectId: string): Task[] {
  return MOCK_TASKS.filter(t => t.projectId === projectId);
}

export function getCommentsByTask(taskId: string): Comment[] {
  return MOCK_COMMENTS.filter(c => c.taskId === taskId);
}

export function getMessagesByChannel(channelId: string): Message[] {
  return MOCK_MESSAGES.filter(m => m.channelId === channelId);
}

export function getTasksByStatus(projectId: string, status: Task['status']): Task[] {
  return MOCK_TASKS.filter(t => t.projectId === projectId && t.status === status)
    .sort((a, b) => a.order - b.order);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date('2026-04-21');
}

export function timeAgo(dateStr: string): string {
  const now = new Date('2026-04-21T14:05:10Z');
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}