'use client';

import React, { useState } from 'react';
import { CURRENT_USER } from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState('daily');

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-800 text-slate-900 mb-1">Settings</h1>
          <p className="text-sm text-slate-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 mb-6">
            <h2 className="text-lg font-700 text-slate-900 mb-6 flex items-center gap-2">
              <Icon name="UserIcon" size={20} />
              Profile Settings
            </h2>

            <div className="space-y-4">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-600 text-slate-700 mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-brand-orange flex items-center justify-center text-white text-2xl font-700">
                    {CURRENT_USER.avatar}
                  </div>
                  <button className="px-4 py-2 border border-slate-300 rounded-lg font-600 hover:bg-slate-50 transition-colors">
                    <Icon name="PhotoIcon" size={16} className="inline mr-2" />
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-600 text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={CURRENT_USER.name}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  disabled
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-600 text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={CURRENT_USER.email}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  disabled
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-600 text-slate-700 mb-2">Role</label>
                <div className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="text-slate-700 font-500">
                    {CURRENT_USER.role === 'admin' ? 'Administrator' : CURRENT_USER.role === 'team_leader' ? 'Team Leader' : 'Agent'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 mb-6">
            <h2 className="text-lg font-700 text-slate-900 mb-6 flex items-center gap-2">
              <Icon name="PaletteIcon" size={20} />
              Theme Preferences
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  checked={theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-600 text-slate-900">Light Mode</p>
                  <p className="text-xs text-slate-600">Clean and bright interface</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  checked={theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-600 text-slate-900">Dark Mode</p>
                  <p className="text-xs text-slate-600">Easy on the eyes in low light</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
            <h2 className="text-lg font-700 text-slate-900 mb-6 flex items-center gap-2">
              <Icon name="BellIcon" size={20} />
              Notifications
            </h2>

            <div className="space-y-4">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-600 text-slate-900">Enable Notifications</p>
                  <p className="text-xs text-slate-600">Receive notifications about task updates and mentions</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                />
              </div>

              {/* Email Digest */}
              <div>
                <label className="block text-sm font-600 text-slate-700 mb-3">Email Digest</label>
                <select
                  value={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
