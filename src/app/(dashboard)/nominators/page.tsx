'use client';

import React, { useState } from 'react';
import { NominatorTable } from '@/modules/nominations/components/NominatorTable';
import { CategoryManageModal } from '@/modules/nominations/components/CategoryManageModal';
import { NominationStatus } from '@/modules/nominations/types/nomination.types';
import { Award, Users, CheckCircle2, XCircle, Settings, Plus } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import Button from '@/components/ui/button/Button';
import Link from 'next/link';
import { useGroupedNominators } from '@/modules/nominations/hooks/useNominations';

export default function NominatorsPage() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Fetch summaries for stats cards
  const { meta: totalMeta } = useGroupedNominators({ limit: 1 });
  const { meta: pendingMeta } = useGroupedNominators({
    limit: 1,
    status: NominationStatus.PENDING,
  });
  const { meta: approvedMeta } = useGroupedNominators({
    limit: 1,
    status: NominationStatus.APPROVED,
  });
  const { meta: rejectedMeta } = useGroupedNominators({
    limit: 1,
    status: NominationStatus.REJECTED,
  });

  const stats = [
    {
      title: 'Total Nominations',
      value: totalMeta?.total || 0,
      icon: <Award size={24} strokeWidth={1.5} />,
      bgIllustration: <Award size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Pending Review',
      value: pendingMeta?.total || 0,
      icon: <Users size={24} strokeWidth={1.5} />,
      bgIllustration: <Users size={100} strokeWidth={1} />,
      iconBgColor: 'bg-warning-50 dark:bg-warning-500/10',
      iconTextColor: 'text-warning-600 dark:text-warning-400',
    },
    {
      title: 'Approved',
      value: approvedMeta?.total || 0,
      icon: <CheckCircle2 size={24} strokeWidth={1.5} />,
      bgIllustration: <CheckCircle2 size={100} strokeWidth={1} />,
      iconBgColor: 'bg-success-50 dark:bg-success-500/10',
      iconTextColor: 'text-success-600 dark:text-success-400',
    },
    {
      title: 'Rejected',
      value: rejectedMeta?.total || 0,
      icon: <XCircle size={24} strokeWidth={1.5} />,
      bgIllustration: <XCircle size={100} strokeWidth={1} />,
      iconBgColor: 'bg-error-50 dark:bg-error-500/10',
      iconTextColor: 'text-error-600 dark:text-error-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nomination Submissions
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Track and review submitted CIO nominations from public websites.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            startIcon={<Settings size={16} />}
          >
            Categories
          </Button>
          <Link href="/nominators/create">
            <Button
              variant="primary"
              startIcon={<Plus size={16} />}
              className="shadow-md shadow-brand-500/20"
            >
              Create Nomination
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <NominatorTable />
      </div>

      <CategoryManageModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
