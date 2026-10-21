'use client';

import React from 'react';
import { CustomFormsTable } from '@/modules/forms/components/CustomFormsTable';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useCustomForms } from '@/modules/forms/hooks/useCustomForms';
import { FormStatus } from '@/modules/forms/types/form.types';

export default function CustomFormsPage() {
  const { meta: totalMeta } = useCustomForms({ limit: 1 });
  const { meta: publishedMeta } = useCustomForms({ limit: 1, status: FormStatus.PUBLISHED });
  const { meta: draftMeta } = useCustomForms({ limit: 1, status: FormStatus.DRAFT });

  const stats = [
    {
      title: 'Total Custom Forms',
      value: totalMeta?.total || 0,
      icon: <FileText size={24} strokeWidth={1.5} />,
      bgIllustration: <FileText size={100} strokeWidth={1} />,
      iconBgColor: 'bg-brand-50 dark:bg-brand-500/10',
      iconTextColor: 'text-brand-600 dark:text-brand-400',
    },
    {
      title: 'Active & Published',
      value: publishedMeta?.total || 0,
      icon: <CheckCircle2 size={24} strokeWidth={1.5} />,
      bgIllustration: <CheckCircle2 size={100} strokeWidth={1} />,
      iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconTextColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Draft Forms',
      value: draftMeta?.total || 0,
      icon: <Clock size={24} strokeWidth={1.5} />,
      bgIllustration: <Clock size={100} strokeWidth={1} />,
      iconBgColor: 'bg-amber-50 dark:bg-amber-500/10',
      iconTextColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Form Builder</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Design dynamic Google Forms-style questionnaires, surveys, and applications for your
            websites.
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

      <div className="min-w-0 bg-white dark:bg-navy-900 rounded-2xl p-3 sm:p-5 border border-gray-200 dark:border-navy-800">
        <CustomFormsTable />
      </div>
    </div>
  );
}
