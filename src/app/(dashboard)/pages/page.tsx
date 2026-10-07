'use client';
import React, { useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { PageManager } from '@/modules/websites/components/PageManager';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useWebsitePages } from '@/modules/websites/hooks/useWebsitePages';
import { PageStatus } from '@/modules/websites/types/cms.types';
import { FileText, CheckCircle, FileEdit } from 'lucide-react';

export default function PagesPage() {
  const { meta: allPages } = useWebsitePages({ limit: 1 });
  const { meta: publishedPages } = useWebsitePages({ limit: 1, status: PageStatus.PUBLISHED });
  const { meta: draftPages } = useWebsitePages({ limit: 1, status: PageStatus.DRAFT });

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  const stats = [
    {
      id: 'ALL',
      title: 'Total Pages',
      value: allPages?.total || 0,
      icon: <FileText size={24} strokeWidth={1.5} />,
      bgIllustration: <FileText size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'PUBLISHED',
      title: 'Published Pages',
      value: publishedPages?.total || 0,
      icon: <CheckCircle size={24} strokeWidth={1.5} />,
      bgIllustration: <CheckCircle size={100} strokeWidth={1} />,
      iconBgColor: 'bg-green-50 dark:bg-green-500/10',
      iconTextColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'DRAFT',
      title: 'Draft Pages',
      value: draftPages?.total || 0,
      icon: <FileEdit size={24} strokeWidth={1.5} />,
      bgIllustration: <FileEdit size={100} strokeWidth={1} />,
      iconBgColor: 'bg-orange-50 dark:bg-orange-500/10',
      iconTextColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageBreadcrumb pageTitle="Website Pages" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <SummaryCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgIllustration={stat.bgIllustration}
            iconBgColor={stat.iconBgColor}
            iconTextColor={stat.iconTextColor}
            onClick={() => setActiveFilter(stat.id as 'ALL' | 'PUBLISHED' | 'DRAFT')}
            isActive={activeFilter === stat.id}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm">
        <PageManager />
      </div>
    </div>
  );
}
