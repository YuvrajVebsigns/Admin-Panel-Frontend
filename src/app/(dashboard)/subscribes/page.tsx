'use client';

import React from 'react';
import { Mail, Globe } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { SubscribeTable } from '@/modules/subscribes/components/SubscribeTable';
import { useSubscribes } from '@/modules/subscribes/hooks/useSubscribes';

export default function SubscribesPage() {
  const { meta } = useSubscribes({ limit: 1 });

  const stats = [
    {
      title: 'Total Subscriptions',
      value: meta?.total || 0,
      icon: <Mail size={24} strokeWidth={1.5} />,
      bgIllustration: <Mail size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Sources',
      value: 0,
      icon: <Globe size={24} strokeWidth={1.5} />,
      bgIllustration: <Globe size={100} strokeWidth={1} />,
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconTextColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Manage the subscription list collected from your admin portals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <SummaryCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgIllustration={stat.bgIllustration}
            iconBgColor={stat.iconBgColor}
            iconTextColor={stat.iconTextColor}
            isActive={false}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-gray-100 dark:border-navy-800 shadow-sm">
        <SubscribeTable />
      </div>
    </div>
  );
}
