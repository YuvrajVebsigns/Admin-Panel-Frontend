'use client';

import React from 'react';
import { NomineeTable } from '@/modules/nominations/components/NomineeTable';
import { NominationStatus } from '@/modules/nominations/types/nomination.types';
import { Award, Briefcase, FileText } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useGroupedNominees } from '@/modules/nominations/hooks/useNominations';
import { useNominationCategories } from '@/modules/nominations/hooks/useNominationCategories';

export default function NomineesPage() {
  // Since nominees are embedded, we use the nominations endpoint for overall metrics
  const { meta: totalMeta } = useGroupedNominees({ limit: 1 });
  const { meta: approvedMeta } = useGroupedNominees({
    limit: 1,
    status: NominationStatus.APPROVED,
  });
  const { meta: categoriesMeta } = useNominationCategories({ limit: 1, isActive: true });

  const stats = [
    {
      title: 'Total Unique Nominees',
      value: totalMeta?.total || 0,
      icon: <FileText size={24} strokeWidth={1.5} />,
      bgIllustration: <FileText size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Nominees with Approved Submissions',
      value: approvedMeta?.total || 0,
      icon: <Award size={24} strokeWidth={1.5} />,
      bgIllustration: <Award size={100} strokeWidth={1} />,
      iconBgColor: 'bg-success-50 dark:bg-success-500/10',
      iconTextColor: 'text-success-600 dark:text-success-400',
    },
    {
      title: 'Active Categories',
      value: categoriesMeta?.total || 0,
      icon: <Briefcase size={24} strokeWidth={1.5} />,
      bgIllustration: <Briefcase size={100} strokeWidth={1} />,
      iconBgColor: 'bg-brand-50 dark:bg-brand-500/10',
      iconTextColor: 'text-brand-600 dark:text-brand-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            CIO Nominees Directory
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Browse and search all individual CIOs that have been nominated.
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
        <NomineeTable />
      </div>
    </div>
  );
}
