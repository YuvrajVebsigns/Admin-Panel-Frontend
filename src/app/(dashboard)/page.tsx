'use client';
import React from 'react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { WebsiteCard } from '@/components/dashboard/WebsiteCard';
import {
  Box,
  Layers,
  Users,
  Briefcase,
  UserCheck,
  Award,
  CalendarCheck,
  Loader2,
} from 'lucide-react';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { useBlogs } from '@/modules/blogs/hooks/useBlogs';
import { useEvents } from '@/modules/events/hooks/useEvents';

export default function DashboardPage() {
  const { websites, meta, isLoading } = useWebsites({ limit: 100 });

  const { meta: blogsMeta, blogs: allBlogs } = useBlogs({ limit: 1000 });

  const { events: allEvents, isLoading: isEventsLoading } = useEvents();

  const blogCountsByWebsite = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (allBlogs) {
      allBlogs.forEach((blog) => {
        blog.websites?.forEach((w) => {
          const id = typeof w === 'string' ? w : ((w.id || w._id) as string);
          if (id) counts[id] = (counts[id] || 0) + 1;
        });
      });
    }
    return counts;
  }, [allBlogs]);

  const eventCountsByWebsite = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (allEvents) {
      allEvents.forEach((event) => {
        event.websites?.forEach((w) => {
          if (typeof w === 'string') {
            if (w) counts[w] = (counts[w] || 0) + 1;
          } else if (w && typeof w === 'object') {
            const obj = w as { id?: string; _id?: string };
            const id = obj.id || obj._id;
            if (id) counts[id] = (counts[id] || 0) + 1;
          }
        });
      });
    }
    return counts;
  }, [allEvents]);

  const SUMMARY_DATA = [
    {
      title: 'TOTAL WEBSITES',
      value: meta?.total || websites.length || 0,
      icon: <Box size={24} strokeWidth={1.5} />,
      bgIllustration: <Box size={100} strokeWidth={1} />,
      iconBgColor: 'bg-purple-50 dark:bg-purple-500/10',
      iconTextColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'TOTAL BLOGS',
      value: blogsMeta?.total || 0,
      icon: <Layers size={24} strokeWidth={1.5} />,
      bgIllustration: <Layers size={100} strokeWidth={1} />,
      iconBgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
      iconTextColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'TOTAL EVENTS',
      value: allEvents?.length || 0,
      icon: <Users size={24} strokeWidth={1.5} />,
      bgIllustration: <Users size={100} strokeWidth={1} />,
      iconBgColor: 'bg-green-50 dark:bg-green-500/10',
      iconTextColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'TOTAL SPONSORS',
      value: 0, // Pending backend
      icon: <Briefcase size={24} strokeWidth={1.5} />,
      bgIllustration: <Briefcase size={100} strokeWidth={1} />,
      iconBgColor: 'bg-red-50 dark:bg-red-500/10',
      iconTextColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'REGISTRATIONS',
      value: '0', // Pending backend
      icon: <UserCheck size={24} strokeWidth={1.5} />,
      bgIllustration: <UserCheck size={100} strokeWidth={1} />,
      iconBgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      iconTextColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'TOTAL NOMINATORS',
      value: 0, // Pending backend
      icon: <Users size={24} strokeWidth={1.5} />,
      bgIllustration: <Users size={100} strokeWidth={1} />,
      iconBgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
      iconTextColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      title: 'TOTAL NOMINEES',
      value: 0, // Pending backend
      icon: <Award size={24} strokeWidth={1.5} />,
      bgIllustration: <Award size={100} strokeWidth={1} />,
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconTextColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'ATTENDANCE',
      value: '0', // Pending backend
      icon: <CalendarCheck size={24} strokeWidth={1.5} />,
      bgIllustration: <CalendarCheck size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  if (isLoading || isEventsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading dashboard data...</p>
      </div>
    );
  }

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
            {websites.length} Results
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {websites.map((site) => (
            <WebsiteCard
              key={site.id}
              id={site.id}
              logo={site.logo}
              title={site.name}
              status={site.isActive ? 'ACTIVE' : 'INACTIVE'}
              blogsCount={blogCountsByWebsite[site.id] || 0}
              eventsCount={eventCountsByWebsite[site.id] || 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
