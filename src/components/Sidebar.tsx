'use client';
import React from 'react';
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

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { key: 'nav-dashboard', label: 'Dashboard', icon: 'Squares2X2Icon', path: '/kanban-board', badge: null },
      { key: 'nav-kanban', label: 'Kanban Board', icon: 'ViewColumnsIcon', path: '/kanban-board', badge: null },
      { key: 'nav-projects', label: 'Projects', icon: 'FolderIcon', path: '/project-management', badge: null },
    ],
  },
  {
    label: 'Team',
    items: [
      { key: 'nav-team', label: 'My Team', icon: 'UserGroupIcon', path: '/project-management', badge: null },
      { key: 'nav-chat', label: 'Team Chat', icon: 'ChatBubbleLeftRightIcon', path: null, badge: 3 },
    ],
  },
  {
    label: 'Admin',
    items: [
      { key: 'nav-users', label: 'Users & Roles', icon: 'UsersIcon', path: '/project-management', badge: null },
      { key: 'nav-settings', label: 'Settings', icon: 'Cog6ToothIcon', path: '/project-management', badge: null },
    ],
  },
];

const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

export default function Sidebar({ collapsed, onToggle, currentPath, mobileOpen, onMobileClose, onChatToggle, chatOpen }: SidebarProps) {
  const sidebarWidth = collapsed ? 'w-16' : 'w-60';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col ${sidebarWidth} bg-brand-navy transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden`}
        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={onToggle}
          currentPath={currentPath}
          onChatToggle={onChatToggle}
          chatOpen={chatOpen}
          unreadNotifs={unreadNotifs}
          onClose={undefined}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)' }}
      >
        <SidebarContent
          collapsed={false}
          onToggle={onToggle}
          currentPath={currentPath}
          onChatToggle={onChatToggle}
          chatOpen={chatOpen}
          unreadNotifs={unreadNotifs}
          onClose={onMobileClose}
        />
      </aside>
    </>
  );
}

function SidebarContent({ collapsed, onToggle, currentPath, onChatToggle, chatOpen, unreadNotifs, onClose }: {
  collapsed: boolean;
  onToggle: () => void;
  currentPath?: string;
  onChatToggle: () => void;
  chatOpen: boolean;
  unreadNotifs: number;
  onClose?: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className={`flex items-center h-16 px-3 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <AppLogo size={32} />
            <span className="font-display text-white font-700 text-base tracking-tight truncate">OotlahPM</span>
          </div>
        )}
        {collapsed && <AppLogo size={32} />}
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
            <div className="w-6 h-6 rounded-md bg-brand-orange flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-700">O</span>
            </div>
            <span className="text-slate-300 text-sm font-500 truncate flex-1 text-left">Ootlah Workspace</span>
            <Icon name="ChevronUpDownIcon" size={14} className="text-slate-500 group-hover:text-slate-300" />
          </button>
        </div>
      )}

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={`group-${group.label}`} className="mb-4">
            {!collapsed && (
              <p className="text-slate-500 text-[10px] font-600 uppercase tracking-widest px-2 mb-1">{group.label}</p>
            )}
            {group.items.map((item) => {
              const isActive = currentPath === item.path;
              const isChat = item.label === 'Team Chat';

              const content = (
                <div
                  className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-all duration-150 group relative ${
                    isActive || (isChat && chatOpen)
                      ? 'bg-brand-orange/20 text-brand-orange-light' :'text-slate-400 hover:bg-white/8 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon
                    name={item.icon as Parameters<typeof Icon>[0]['name']}
                    size={18}
                    className={`flex-shrink-0 ${isActive || (isChat && chatOpen) ? 'text-brand-orange' : 'text-slate-400 group-hover:text-white'}`}
                  />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-500 flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="bg-brand-orange text-white text-[10px] font-700 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-orange rounded-full text-[9px] text-white font-700 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
              );

              if (isChat) {
                return (
                  <button key={item.key} onClick={onChatToggle} className="w-full text-left">
                    {content}
                  </button>
                );
              }

              return item.path ? (
                <Link key={item.key} href={item.path}>
                  {content}
                </Link>
              ) : (
                <div key={item.key}>{content}</div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user */}
      <div className={`border-t border-white/10 p-3 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-700">{CURRENT_USER.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-600 truncate">{CURRENT_USER.name}</p>
              <p className="text-slate-500 text-[11px] capitalize">{CURRENT_USER.role.replace('_', ' ')}</p>
            </div>
            <button className="p-1 rounded text-slate-500 hover:text-white transition-colors">
              <Icon name="ArrowRightOnRectangleIcon" size={16} />
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center">
            <span className="text-white text-xs font-700">{CURRENT_USER.avatar}</span>
          </div>
        )}
      </div>
    </>
  );
}