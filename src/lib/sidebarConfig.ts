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
  // Main Navigation - Available to All
  { key: 'dashboard', label: 'Global Dashboard', icon: 'Squares2X2Icon', path: '/dashboard', roles: ['admin', 'team_leader', 'agent'] },
  { key: 'workflow', label: 'Workflow Board', icon: 'ViewColumnsIcon', path: '/kanban-board', roles: ['admin', 'team_leader', 'agent'] },
  { key: 'my-tasks', label: 'My Tasks', icon: 'ClipboardDocumentCheckIcon', path: '/my-tasks', roles: ['admin', 'team_leader', 'agent'] },
  { key: 'projects', label: 'My Projects', icon: 'FolderIcon', path: '/project-management', roles: ['admin', 'team_leader', 'agent'] },
  
  // Admin & Team Leader Features
  { key: 'portfolios', label: 'Portfolios', icon: 'RectangleStackIcon', path: '/portfolios', roles: ['admin', 'team_leader'] },
  { key: 'approval-queue', label: 'Approvals', icon: 'ClipboardDocumentListIcon', path: '/approval-queue', roles: ['admin', 'team_leader'], badge: 'pendingApprovals' },
  { key: 'reporting', label: 'Reporting', icon: 'ChartBarIcon', path: '/reporting', roles: ['admin', 'team_leader'] },
  
  // Admin Only
  { key: 'team-management', label: 'Team Management', icon: 'UserGroupIcon', path: '/team-management', roles: ['admin'] },
  { key: 'departments', label: 'Departments', icon: 'RectangleGroupIcon', path: '/departments', roles: ['admin'] },
  { key: 'users-roles', label: 'Users & Roles', icon: 'UsersIcon', path: '/users-roles', roles: ['admin'] },
  { key: 'settings', label: 'Settings', icon: 'Cog6ToothIcon', path: '/settings', roles: ['admin'] },
];

export const SIDEBAR_SECTIONS: Record<UserRole, string[]> = {
  admin: ['Main', 'Management', 'Administration'],
  team_leader: ['Main', 'Management'],
  agent: ['Main'],
};

export function getVisibleItems(role: UserRole): SidebarItem[] {
  return SIDEBAR_CONFIG.filter(item => item.roles.includes(role));
}

export function getSectionItems(role: UserRole): SidebarSection[] {
  const visibleItems = getVisibleItems(role);
  const sections = SIDEBAR_SECTIONS[role];

  const sectionMap: Record<string, SidebarItem[]> = {
    'Main': [],
    'Management': [],
    'Administration': [],
  };

  visibleItems.forEach(item => {
    if (['dashboard', 'workflow', 'my-tasks', 'projects'].includes(item.key)) {
      sectionMap['Main'].push(item);
    }
    if (['portfolios', 'approval-queue', 'reporting', 'team-management', 'departments'].includes(item.key)) {
      sectionMap['Management'].push(item);
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
