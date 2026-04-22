'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { CURRENT_USER } from '@/lib/mockData';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
    taskAssigned: true,
    taskCompleted: true,
    dailyDigest: false,
  });

  return (
    <AppLayout currentPath="/settings">
      <div className="max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-800 text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account and application preferences</p>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-700 text-slate-900 mb-6 pb-4 border-b border-slate-200">Account Information</h2>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-600 text-slate-900 mb-3">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-700">
                  {CURRENT_USER.name.charAt(0)}
                </div>
                <button className="px-4 py-2 border border-slate-300 rounded-lg font-600 text-slate-700 hover:bg-slate-50 transition-colors">
                  Change Picture
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-600 text-slate-900 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={CURRENT_USER.name}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-600 text-slate-900 mb-2">Email Address</label>
              <input
                type="email"
                defaultValue={CURRENT_USER.email}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-600 text-slate-900 mb-2">Role</label>
              <div className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-600">
                {CURRENT_USER.role.charAt(0).toUpperCase() + CURRENT_USER.role.slice(1)}
              </div>
            </div>
          </div>

          <button className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Theme Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-700 text-slate-900 mb-6 pb-4 border-b border-slate-200">Appearance</h2>

          <div>
            <label className="block text-sm font-600 text-slate-900 mb-3">Theme</label>
            <div className="space-y-3">
              {[
                { id: 'light', label: 'Light', icon: 'SunIcon' },
                { id: 'dark', label: 'Dark', icon: 'MoonIcon' },
                { id: 'auto', label: 'Auto (System)', icon: 'ComputerDesktopIcon' },
              ].map(option => (
                <label key={option.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="theme"
                    value={option.id}
                    checked={theme === option.id}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <Icon name={option.icon as any} size={18} className="text-slate-600" />
                  <span className="font-600 text-slate-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-700 text-slate-900 mb-6 pb-4 border-b border-slate-200">Notifications</h2>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'desktop', label: 'Desktop Notifications', desc: 'Receive browser notifications' },
              { key: 'taskAssigned', label: 'Task Assigned to Me', desc: 'Get notified when tasks are assigned' },
              { key: 'taskCompleted', label: 'Task Completed', desc: 'Get notified when related tasks are completed' },
              { key: 'dailyDigest', label: 'Daily Digest', desc: 'Receive a daily summary of activities' },
            ].map(setting => (
              <div key={setting.key} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-600 text-slate-900">{setting.label}</p>
                  <p className="text-sm text-slate-600">{setting.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [setting.key]: !prev[setting.key as keyof typeof notifications] }))}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications[setting.key as keyof typeof notifications] ? 'bg-red-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications[setting.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-700 text-red-900 mb-4">Danger Zone</h2>
          <p className="text-sm text-red-700 mb-4">Irreversible actions that cannot be undone</p>
          <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-600 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
