'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import {
  useCurrentUser,
  useUnreadNotifications,
  usePendingApprovals,
} from '@/lib/hooks/useCurrentUser';
import type { UserRole } from '@/types/database';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath?: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onChatToggle?: () => void;
  chatOpen?: boolean;
}

type BadgeSource = 'approvals' | 'inbox' | null;

interface NavItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  badge?: BadgeSource;
}

// Every nav item is a standalone link — no accordion groups.
// Each entry is visible to exactly the roles listed and opens ONLY its own page.
const SIDEBAR_ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: 'HomeIcon',
    path: '/dashboard',
    roles: ['admin', 'team_leader', 'agent'],
  },
  {
    key: 'global-dashboard',
    label: 'Global Dashboard',
    icon: 'Square3Stack3DIcon',
    path: '/global-dashboard',
    roles: ['admin'],
  },
  {
    key: 'portfolios',
    label: 'Portfolios',
    icon: 'BriefcaseIcon',
    path: '/portfolios',
    roles: ['admin', 'team_leader'],
  },
  {
    key: 'reporting',
    label: 'Reporting',
    icon: 'ChartBarIcon',
    path: '/reporting',
    roles: ['admin', 'team_leader'],
  },
  {
    key: 'my-tasks',
    label: 'My Tasks',
    icon: 'CheckCircleIcon',
    path: '/my-tasks',
    roles: ['admin', 'team_leader', 'agent'],
  },
  {
    key: 'my-projects',
    label: 'My Projects',
    icon: 'FolderOpenIcon',
    path: '/my-projects',
    roles: ['admin', 'team_leader', 'agent'],
  },
  {
    key: 'team-dashboard',
    label: 'Team Dashboard',
    icon: 'UsersIcon',
    path: '/team-dashboard',
    roles: ['admin', 'team_leader'],
  },
  {
    key: 'approval-queue',
    label: 'Approval Queue',
    icon: 'ShieldCheckIcon',
    path: '/approval-queue',
    roles: ['admin', 'team_leader'],
    badge: 'approvals',
  },
  {
    key: 'resources',
    label: 'Resources',
    icon: 'BookOpenIcon',
    path: '/resources',
    roles: ['admin', 'team_leader'],
  },
  {
    key: 'goals',
    label: 'Personal Goals',
    icon: 'FlagIcon',
    path: '/goals',
    roles: ['admin', 'team_leader', 'agent'],
  },
  {
    key: 'inbox',
    label: 'Inbox',
    icon: 'InboxIcon',
    path: '/inbox',
    roles: ['admin', 'team_leader', 'agent'],
    badge: 'inbox',
  },
  {
    key: 'user-management',
    label: 'User Management',
    icon: 'UserGroupIcon',
    path: '/admin/users',
    roles: ['admin'],
  },
  {
    key: 'departments',
    label: 'Departments',
    icon: 'BuildingOfficeIcon',
    path: '/admin/departments',
    roles: ['admin'],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'Cog6ToothIcon',
    path: '/settings',
    roles: ['admin', 'team_leader', 'agent'],
  },
];

function ROLE_LABEL(role: UserRole): string {
  return role === 'admin' ? 'Admin' : role === 'team_leader' ? 'Team Leader' : 'Agent';
}

export default function Sidebar({
  collapsed,
  onToggle,
  currentPath,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const sidebarWidth = collapsed ? 'w-16' : 'w-64';

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col ${sidebarWidth} bg-surface-dark transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden border-r border-brand-gold/10`}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={onToggle}
          currentPath={currentPath}
          onClose={undefined}
        />
      </aside>

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-surface-dark flex flex-col transition-transform duration-300 ease-in-out border-r border-brand-gold/10 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent
          collapsed={false}
          onToggle={onToggle}
          currentPath={currentPath}
          onClose={onMobileClose}
        />
      </aside>
    </>
  );
}

interface ContentProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath?: string;
  onClose?: () => void;
}

function SidebarContent({ collapsed, onToggle, currentPath, onClose }: ContentProps) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const unreadNotifs = useUnreadNotifications();
  const pendingApprovals = usePendingApprovals();

  const role: UserRole | null = user?.role ?? null;
  const visibleItems = role ? SIDEBAR_ITEMS.filter((i) => i.roles.includes(role)) : [];

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/sign-up-login-screen');
    router.refresh();
  }

  return (
    <>
      {/* Header */}
      <div
        className={`flex items-center h-16 px-3 border-b border-brand-gold/10 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Ootlah" className="w-8 h-8 rounded" />
            <span className="font-display text-content-primary font-700 text-base tracking-tight truncate">
              Ootlah PM
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Ootlah" className="w-8 h-8 rounded" />
          </Link>
        )}
        <button
          onClick={onClose || onToggle}
          className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-brand-gold/10 transition-colors duration-150 flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={onClose ? 'XMarkIcon' : collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
            size={16}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-1">
        {loading && <div className="px-3 py-2 text-xs text-content-muted">Loading...</div>}
        {!loading &&
          visibleItems.map((item) => {
            const isActive =
              currentPath === item.path || (currentPath?.startsWith(item.path + '/') ?? false);
            const badgeCount =
              item.badge === 'inbox'
                ? unreadNotifs
                : item.badge === 'approvals'
                  ? pendingApprovals
                  : 0;

            return (
              <Link
                key={item.key}
                href={item.path}
                onClick={onClose}
                title={collapsed ? item.label : ''}
                className={`relative flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-gold/10 text-brand-gold border-l-2 border-brand-gold'
                    : 'text-content-secondary hover:bg-brand-gold/5 hover:text-brand-gold-light border-l-2 border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  name={item.icon as Parameters<typeof Icon>[0]['name']}
                  size={18}
                  className={`flex-shrink-0 ${isActive ? 'text-brand-gold' : 'text-content-secondary group-hover:text-brand-gold-light'}`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-500">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="bg-brand-gold text-brand-navy-dark text-xs font-700 px-1.5 py-0.5 rounded-full">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Footer: avatar + name + role + logout */}
      <div className="border-t border-brand-gold/10 p-2 flex-shrink-0">
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gold to-brand-amber flex-shrink-0 flex items-center justify-center text-brand-navy-dark text-sm font-700">
              {(user.full_name ?? user.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-600 text-content-primary truncate">
                {user.full_name ?? user.email}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-brand-gold font-700">
                {ROLE_LABEL(user.role)}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-content-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-colors"
            >
              <Icon name="ArrowRightOnRectangleIcon" size={16} />
            </button>
          </div>
        )}
        {user && collapsed && (
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-full flex items-center justify-center p-2 rounded-lg text-content-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-colors"
          >
            <Icon name="ArrowRightOnRectangleIcon" size={18} />
          </button>
        )}
      </div>
    </>
  );
}
