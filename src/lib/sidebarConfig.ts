export type UserRole = 'admin' | 'team_leader' | 'agent';

export interface SidebarItem {
  key: string;
  label: string;
  icon: string;
  path: string | null;
  roles: UserRole[];
  badge?: string | number;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export const SIDEBAR_CONFIG: SidebarItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'Squares2X2Icon', path: '/dashboard', roles: ['admin', 'team_leader', 'agent'] },
  { key: 'my-tasks', label: 'My Tasks', icon: 'ClipboardDocumentCheckIcon', path: '/my-tasks', roles: ['admin', 'team_leader', 'agent'] },
  { key: 'kanban', label: 'Kanban Board', icon: 'ViewColumnsIcon', path: '/kanban-board', roles: ['admin', 'team_leader', 'agent'] },
  { key: 'projects', label: 'Projects', icon: 'FolderIcon', path: '/project-management', roles: ['admin', 'team_leader', 'agent'] },
  { key: 'portfolios', label: 'Portfolios', icon: 'RectangleStackIcon', path: '/portfolios', roles: ['admin', 'team_leader'] },
  { key: 'approval-queue', label: 'Approval Queue', icon: 'ClipboardDocumentListIcon', path: '/approval-queue', roles: ['admin', 'team_leader'], badge: 'pendingApprovals' },
  { key: 'team-chat', label: 'Team Chat', icon: 'ChatBubbleLeftRightIcon', path: null, roles: ['admin', 'team_leader', 'agent'], badge: 3 },
  { key: 'my-team', label: 'My Team', icon: 'UserGroupIcon', path: '/project-management', roles: ['admin', 'team_leader'] },
  { key: 'reporting', label: 'Reporting', icon: 'ChartBarIcon', path: '/reporting', roles: ['admin', 'team_leader'] },
  { key: 'users-roles', label: 'Users & Roles', icon: 'UsersIcon', path: '/project-management', roles: ['admin'] },
  { key: 'settings', label: 'Settings', icon: 'Cog6ToothIcon', path: '/settings', roles: ['admin'] },
];

export const SIDEBAR_SECTIONS: Record<UserRole, string[]> = {
  admin: ['Workspace', 'Team', 'Administration'],
  team_leader: ['Workspace', 'Team', 'My Work'],
  agent: ['Workspace', 'My Work'],
};

export function getVisibleItems(role: UserRole): SidebarItem[] {
  return SIDEBAR_CONFIG.filter(item => item.roles.includes(role));
}

export function getSectionItems(role: UserRole): SidebarSection[] {
  const visibleItems = getVisibleItems(role);
  const sections = SIDEBAR_SECTIONS[role];

  const sectionMap: Record<string, SidebarItem[]> = {
    'Workspace': [],
    'My Work': [],
    'Team': [],
    'Administration': [],
  };

  visibleItems.forEach(item => {
    if (['dashboard', 'kanban', 'projects'].includes(item.key)) {
      sectionMap['Workspace'].push(item);
    }
    if (['my-tasks'].includes(item.key)) {
      sectionMap['My Work'].push(item);
    }
    if (['my-team', 'team-chat', 'approval-queue', 'portfolios', 'reporting'].includes(item.key)) {
      sectionMap['Team'].push(item);
    }
    if (['users-roles', 'settings'].includes(item.key)) {
      sectionMap['Administration'].push(item);
    }
  });

  return sections
    .map(sectionName => ({
      label: sectionName,
      items: sectionMap[sectionName] || [],
    }))
    .filter(section => section.items.length > 0);
}
