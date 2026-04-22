import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    'brand-orange': 'bg-brand-orange/10 text-brand-orange',
    'red-500': 'bg-red-500/10 text-red-500',
    'blue-500': 'bg-blue-500/10 text-blue-500',
    'green-500': 'bg-green-500/10 text-green-500',
  } as const;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-lg`}>
          <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={24} />
        </div>
      </div>
    </div>
  );
}
