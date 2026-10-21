'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommunicationLogsTable } from '@/modules/communications/components/CommunicationLogsTable';
import { SendMessageModal } from '@/modules/communications/components/SendMessageModal';
import {
  CommunicationLog,
  CommunicationStatus,
} from '@/modules/communications/types/communication.types';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useCommunicationLogs } from '@/modules/communications/hooks/useCommunicationLogs';
import { Radio, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import Button from '@/components/ui/button/Button';

export default function DeliveryReportPage() {
  const router = useRouter();
  const [isSendOpen, setIsSendOpen] = useState(false);

  // Stats queries (minimal fetch for counts)
  const { meta: totalMeta } = useCommunicationLogs({ limit: 1 });
  const { meta: pendingMeta } = useCommunicationLogs({
    limit: 1,
    status: CommunicationStatus.PENDING,
  });
  const { meta: sentMeta } = useCommunicationLogs({ limit: 1, status: CommunicationStatus.SENT });
  const { meta: failedMeta } = useCommunicationLogs({
    limit: 1,
    status: CommunicationStatus.FAILED,
  });

  const stats = [
    {
      title: 'Total Messages',
      value: totalMeta?.total || 0,
      icon: <Radio size={24} strokeWidth={1.5} />,
      bgIllustration: <Radio size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Pending Delivery',
      value: pendingMeta?.total || 0,
      icon: <Clock size={24} strokeWidth={1.5} />,
      bgIllustration: <Clock size={100} strokeWidth={1} />,
      iconBgColor: 'bg-amber-50 dark:bg-amber-500/10',
      iconTextColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Sent Successfully',
      value: sentMeta?.total || 0,
      icon: <CheckCircle2 size={24} strokeWidth={1.5} />,
      bgIllustration: <CheckCircle2 size={100} strokeWidth={1} />,
      iconBgColor: 'bg-green-50 dark:bg-green-500/10',
      iconTextColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Failed',
      value: failedMeta?.total || 0,
      icon: <AlertTriangle size={24} strokeWidth={1.5} />,
      bgIllustration: <AlertTriangle size={100} strokeWidth={1} />,
      iconBgColor: 'bg-red-50 dark:bg-red-500/10',
      iconTextColor: 'text-red-600 dark:text-red-400',
    },
  ];

  const handleViewLog = (log: CommunicationLog) => {
    router.push(
      `/communications/delivery-report/view?id=${log.id || (log as unknown as { _id?: string })._id}`,
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Report</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Monitor and audit all outbound messaging channels (Email, SMS, Push, and Webhook logs).
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsSendOpen(true)}
          startIcon={<Send size={16} />}
          className="shadow-lg shadow-brand-500/20 font-bold"
        >
          Send Message
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Table Card */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6">
        <CommunicationLogsTable onViewDetails={handleViewLog} />
      </div>

      {/* Modals */}
      <SendMessageModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
    </div>
  );
}
