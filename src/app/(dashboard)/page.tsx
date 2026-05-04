import React from 'react';
import { Metadata } from 'next';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { WebsiteCard } from '@/components/dashboard/WebsiteCard';
import { Box, Layers, Users, Briefcase, UserCheck, Award, CalendarCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | Core Media Admin',
  description: 'Core Media Admin Dashboard',
};

const SUMMARY_DATA = [
  {
    title: 'TOTAL WEBSITES',
    value: 11,
    icon: <Box size={24} strokeWidth={1.5} />,
    bgIllustration: <Box size={100} strokeWidth={1} />,
    iconBgColor: 'bg-purple-50 dark:bg-purple-500/10',
    iconTextColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'TOTAL BLOGS',
    value: 38,
    icon: <Layers size={24} strokeWidth={1.5} />,
    bgIllustration: <Layers size={100} strokeWidth={1} />,
    iconBgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
    iconTextColor: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    title: 'TOTAL EVENTS',
    value: 18,
    icon: <Users size={24} strokeWidth={1.5} />,
    bgIllustration: <Users size={100} strokeWidth={1} />,
    iconBgColor: 'bg-green-50 dark:bg-green-500/10',
    iconTextColor: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'TOTAL SPONSORS',
    value: 27,
    icon: <Briefcase size={24} strokeWidth={1.5} />,
    bgIllustration: <Briefcase size={100} strokeWidth={1} />,
    iconBgColor: 'bg-red-50 dark:bg-red-500/10',
    iconTextColor: 'text-red-600 dark:text-red-400',
  },
  {
    title: 'REGISTRATIONS',
    value: '2,500',
    icon: <UserCheck size={24} strokeWidth={1.5} />,
    bgIllustration: <UserCheck size={100} strokeWidth={1} />,
    iconBgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconTextColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'TOTAL NOMINATORS',
    value: 5,
    icon: <Users size={24} strokeWidth={1.5} />,
    bgIllustration: <Users size={100} strokeWidth={1} />,
    iconBgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
    iconTextColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    title: 'TOTAL NOMINEES',
    value: 10,
    icon: <Award size={24} strokeWidth={1.5} />,
    bgIllustration: <Award size={100} strokeWidth={1} />,
    iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconTextColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'ATTENDANCE',
    value: '1,200',
    icon: <CalendarCheck size={24} strokeWidth={1.5} />,
    bgIllustration: <CalendarCheck size={100} strokeWidth={1} />,
    iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
    iconTextColor: 'text-blue-600 dark:text-blue-400',
  },
];

const WEBSITES_DATA = [
  { id: 1, title: 'CORE Media Group', status: 'ACTIVE', blogsCount: 5, eventsCount: 5 },
  { id: 2, title: 'CIO Powerlist', status: 'ACTIVE', blogsCount: 4, eventsCount: 3 },
  { id: 3, title: 'CIO Dialogues', status: 'ACTIVE', blogsCount: 3, eventsCount: 2 },
  { id: 4, title: 'LeaderNext', status: 'ACTIVE', blogsCount: 3, eventsCount: 3 },
  { id: 5, title: 'CIO Choice', status: 'ACTIVE', blogsCount: 3, eventsCount: 2 },
  { id: 6, title: 'CIO Crown', status: 'ACTIVE', blogsCount: 2, eventsCount: 2 },
  { id: 7, title: 'CXO Capital', status: 'ACTIVE', blogsCount: 2, eventsCount: 2 },
  { id: 8, title: 'MEA CIO Powerlist', status: 'ACTIVE', blogsCount: 15, eventsCount: 1 },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      {/* Top Metrics Section */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUMMARY_DATA.map((data, index) => (
            <SummaryCard
              key={index}
              title={data.title}
              value={data.value}
              icon={data.icon}
              bgIllustration={data.bgIllustration}
              iconBgColor={data.iconBgColor}
              iconTextColor={data.iconTextColor}
            />
          ))}
        </div>
      </section>

      {/* Manage Websites Section */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-white mb-1">
              Manage Websites
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Viewing all managed properties
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-sm font-medium text-gray-400 dark:text-gray-500">
            {WEBSITES_DATA.length} Results
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {WEBSITES_DATA.map((site) => (
            <WebsiteCard
              key={site.id}
              index={site.id}
              title={site.title}
              status={site.status}
              blogsCount={site.blogsCount}
              eventsCount={site.eventsCount}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
