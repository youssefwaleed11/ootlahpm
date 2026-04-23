'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { CURRENT_USER, MOCK_NOTIFICATIONS } from '@/lib/mockData';

interface TopbarProps {
  onMobileMenuToggle: () => void;
  onChatToggle: () => void;
  chatOpen: boolean;
}

export default function Topbar({ onMobileMenuToggle, onChatToggle, chatOpen }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead);

  const notifTypeIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'ClipboardDocumentCheckIcon';
      case 'task_overdue':
        return 'ExclamationTriangleIcon';
      case 'comment_added':
        return 'ChatBubbleLeftIcon';
      case 'project_created':
        return 'FolderPlusIcon';
      default:
        return 'BellIcon';
    }
  };

  const notifTypeColor = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'text-brand-teal';
      case 'task_overdue':
        return 'text-red-500';
      case 'comment_added':
        return 'text-brand-orange';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6 flex-shrink-0 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Icon name="Bars3Icon" size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Icon
            name="MagnifyingGlassIcon"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search tasks, projects, team..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder-slate-400 transition-all duration-150"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 hidden sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Chat toggle */}
        <button
          onClick={onChatToggle}
          className={`p-2 rounded-lg transition-colors duration-150 ${chatOpen ? 'bg-brand-teal/10 text-brand-teal' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
        >
          <Icon name="ChatBubbleLeftRightIcon" size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150"
          >
            <Icon name="BellIcon" size={18} />
            {unread.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-orange rounded-full text-[9px] text-white font-700 flex items-center justify-center">
                {unread.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-modal border border-slate-200 z-50 fade-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="text-sm font-600 text-slate-800">Notifications</h3>
                <span className="text-xs text-brand-orange font-500 cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {MOCK_NOTIFICATIONS.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors ${!notif.isRead ? 'bg-orange-50/40' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon
                        name={notifTypeIcon(notif.type) as Parameters<typeof Icon>[0]['name']}
                        size={16}
                        className={`mt-0.5 flex-shrink-0 ${notifTypeColor(notif.type)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-600 text-slate-800 truncate">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center border-t border-slate-100">
                <span className="text-xs text-slate-500 hover:text-brand-orange cursor-pointer transition-colors">
                  View all notifications
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center">
            <span className="text-white text-[11px] font-700">{CURRENT_USER.avatar}</span>
          </div>
          <span className="text-sm font-500 text-slate-700 hidden sm:block">
            {CURRENT_USER.name.split(' ')[0]}
          </span>
          <Icon name="ChevronDownIcon" size={14} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
