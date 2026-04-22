'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface ReportMetric {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down';
  color: string;
}

export default function ReportingPage() {
  const [dateRange, setDateRange] = useState('month');

  const metrics: ReportMetric[] = [
    { label: 'Revenue Generated', value: '$125,400', change: '+12%', changeType: 'up', color: 'text-green-600' },
    { label: 'Active Projects', value: 28, change: '+3', changeType: 'up', color: 'text-blue-600' },
    { label: 'Team Utilization', value: '87%', change: '+5%', changeType: 'up', color: 'text-purple-600' },
    { label: 'On-Time Delivery Rate', value: '92%', change: '-2%', changeType: 'down', color: 'text-orange-600' },
  ];

  const departmentMetrics = [
    { name: 'Marketing', revenue: 35600, projects: 8, efficiency: 94, tasks: 28 },
    { name: 'SEO', revenue: 28900, projects: 6, efficiency: 88, tasks: 22 },
    { name: 'Content', revenue: 22500, projects: 5, efficiency: 96, tasks: 20 },
    { name: 'BD', revenue: 18200, projects: 4, efficiency: 85, tasks: 18 },
    { name: 'Designers', revenue: 12100, projects: 3, efficiency: 90, tasks: 20 },
    { name: 'Social Media', revenue: 8100, projects: 2, efficiency: 89, tasks: 16 },
  ];

  return (
    <AppLayout currentPath="/reporting">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-800 text-slate-900 mb-2">Reporting & Analytics</h1>
            <p className="text-slate-600">Financial and productivity metrics for your organization</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg font-500 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-sm font-600 text-slate-600 uppercase mb-2">{metric.label}</p>
              <div className="flex items-end justify-between">
                <p className={`text-3xl font-800 ${metric.color}`}>{metric.value}</p>
                {metric.change && (
                  <span className={`text-sm font-600 ${metric.changeType === 'up' ? 'text-green-600' : 'text-orange-600'}`}>
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-700 text-slate-900 mb-4">Department Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-700 text-slate-900 text-sm">Department</th>
                  <th className="text-right py-3 px-4 font-700 text-slate-900 text-sm">Revenue</th>
                  <th className="text-right py-3 px-4 font-700 text-slate-900 text-sm">Projects</th>
                  <th className="text-right py-3 px-4 font-700 text-slate-900 text-sm">Efficiency</th>
                  <th className="text-right py-3 px-4 font-700 text-slate-900 text-sm">Tasks</th>
                </tr>
              </thead>
              <tbody>
                {departmentMetrics.map((dept, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-600 text-slate-900">{dept.name}</td>
                    <td className="py-4 px-4 text-right text-slate-900 font-600">${dept.revenue.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-slate-900 font-600">{dept.projects}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                            style={{ width: `${dept.efficiency}%` }}
                          />
                        </div>
                        <span className="text-sm font-600 text-slate-900">{dept.efficiency}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-slate-900 font-600">{dept.tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 mt-4 pt-4 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-800 text-slate-900">
                ${departmentMetrics.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-700 text-slate-900 mb-4">Revenue Trend</h3>
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500 font-500">Chart visualization coming soon</p>
            </div>
          </div>

          {/* Task Completion */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-700 text-slate-900 mb-4">Task Completion Rate</h3>
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500 font-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
