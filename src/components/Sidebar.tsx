'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { CURRENT_USER, MOCK_NOTIFICATIONS } from '@/lib/mockData';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath?: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onChatToggle: () => void;
  chatOpen: boolean;
}

interface NavItem {
  key: string;
  label: string;
  icon: string;
  path: string | null;
  badge?: number | null;
  children?: NavItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { key: 'nav-home', label: 'Home', icon: 'HomeIcon', path: '/dashboard' },
    ],
  },
  {
    label: 'Company',
    items: [
      { key: 'nav-global-dashboard', label: 'Global Dashboard', icon: 'Square3Stack3DIcon', path: '/dashboard' },
      { key: 'nav-portfolios', label: 'Portfolios', icon: 'BriefcaseIcon', path: '/portfolios' },
      { key: 'nav-reporting', label: 'Reporting', icon: 'ChartBarIcon', path: '/reporting' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { key: 'nav-my-tasks', label: 'My Tasks', icon: 'CheckCircleIcon', path: '/my-tasks' },
      { key: 'nav-my-projects', label: 'My Projects', icon: 'FolderOpenIcon', path: '/my-projects' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { key: 'nav-settings', label: 'Settings', icon: 'Cog6ToothIcon', path: '/settings' },
    ],
  },
];

const ADMIN_NAV_GROUP: NavGroup = {
  label: 'Administration',
  items: [
    { key: 'nav-user-mgmt', label: 'User Management', icon: 'UserGroupIcon', path: '/admin/users' },
    { key: 'nav-dept-settings', label: 'Department Settings', icon: 'BuildingOfficeIcon', path: '/admin/departments' },
  ],
};

const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

export default function Sidebar({ collapsed, onToggle, currentPath, mobileOpen, onMobileClose, onChatToggle, chatOpen }: SidebarProps) {
  const sidebarWidth = collapsed ? 'w-16' : 'w-64';
  const isAdmin = CURRENT_USER.role === 'admin';
  const allNavGroups = isAdmin ? [...NAV_GROUPS, ADMIN_NAV_GROUP] : NAV_GROUPS;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col ${sidebarWidth} bg-brand-navy transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden border-r border-white/10`}
        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={onToggle}
          currentPath={currentPath}
          onChatToggle={onChatToggle}
          chatOpen={chatOpen}
          navGroups={allNavGroups}
          unreadNotifs={unreadNotifs}
          onClose={undefined}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy flex flex-col transition-transform duration-300 ease-in-out border-r border-white/10 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
      >
        <SidebarContent
          collapsed={false}
          onToggle={onToggle}
          currentPath={currentPath}
          onChatToggle={onChatToggle}
          chatOpen={chatOpen}
          navGroups={allNavGroups}
          unreadNotifs={unreadNotifs}
          onClose={onMobileClose}
        />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath?: string;
  onChatToggle: () => void;
  chatOpen: boolean;
  navGroups: NavGroup[];
  unreadNotifs: number;
  onClose?: () => void;
}

function SidebarContent({ 
  collapsed, 
  onToggle, 
  currentPath, 
  onChatToggle, 
  chatOpen, 
  navGroups,
  unreadNotifs, 
  onClose 
}: SidebarContentProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Main']));

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <>
      {/* Header */}
      <div className={`flex items-center h-16 px-3 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Ootlah" className="w-8 h-8 rounded" />
            <span className="font-display text-white font-700 text-base tracking-tight truncate">Ootlah PM</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Ootlah" className="w-8 h-8 rounded" />
          </Link>
        )}
        <button
          onClick={onClose || onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-150 flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={onClose ? 'XMarkIcon' : (collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon')} size={16} />
        </button>
      </div>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-white/10">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors duration-150 group">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-700">O</span>
            </div>
            <span className="text-slate-300 text-sm font-500 truncate flex-1 text-left">Ootlah Agency</span>
            <Icon name="ChevronUpDownIcon" size={14} className="text-slate-500 group-hover:text-slate-300" />
          </button>
        </div>
      )}

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.label);
          const isCollapsed = collapsed;

          return (
            <div key={`group-${group.label}`} className="mb-4">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1.5 mb-1 text-slate-500 text-[10px] font-600 uppercase tracking-widest hover:text-slate-400 transition-colors duration-150 group"
                >
                  <span>{group.label}</span>
                  <Icon 
                    name={isExpanded ? 'ChevronDownIcon' : 'ChevronRightIcon'} 
                    size={12}
                    className="text-slate-600 group-hover:text-slate-400 transition-transform duration-200"
                  />
                </button>
              )}

              {(isCollapsed || isExpanded) && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = currentPath === item.path;

                    return (
                      <NavItemComponent
                        key={item.key}
                        item={item}
                        isActive={isActive}
                        collapsed={isCollapsed}
                        onItemClick={onClose}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section - User & Chat */}
      <div className="border-t border-white/10 p-2 flex-shrink-0 space-y-2">
        {/* Chat Toggle */}
        <button
          onClick={onChatToggle}
          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-150 group relative ${
            chatOpen
              ? 'bg-red-500/20 text-red-400'
              : 'text-slate-400 hover:bg-white/8 hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Messages' : ''}
        >
          <Icon
            name="ChatBubbleLeftRightIcon"
            size={18}
            className={`flex-shrink-0 ${chatOpen ? 'text-red-400' : 'text-slate-400 group-hover:text-white'}`}
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Messages</span>
              {unreadNotifs > 0 && (
                <span className="bg-red-500 text-white text-xs font-600 px-1.5 py-0.5 rounded-full">
                  {unreadNotifs}
                </span>
              )}
            </>
          )}
        </button>

        {/* User Profile */}
        {!collapsed && (
          <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-slate-400 hover:bg-white/8 hover:text-white transition-colors duration-150 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-600">
              {CURRENT_USER.name.charAt(0)}
            </div>
            <span className="text-sm font-500 truncate flex-1 text-left">{CURRENT_USER.name}</span>
            <Icon name="EllipsisHorizontalIcon" size={16} className="text-slate-600 group-hover:text-slate-400" />
          </button>
        )}
      </div>
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onItemClick?: () => void;
}

function NavItemComponent({ item, isActive, collapsed, onItemClick }: NavItemComponentProps) {
  if (!item.path) return null;

  return (
    <Link
      href={item.path}
      onClick={onItemClick}
      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-all duration-150 group relative ${
        isActive
          ? 'bg-red-500/20 text-red-400'
          : 'text-slate-400 hover:bg-white/8 hover:text-white'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? item.label : ''}
    >
      <Icon
        name={item.icon as Parameters<typeof Icon>[0]['name']}
        size={18}
        className={`flex-shrink-0 ${isActive ? 'text-red-400' : 'text-slate-400 group-hover:text-white'}`}
      />
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="bg-red-500 text-white text-xs font-600 px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
