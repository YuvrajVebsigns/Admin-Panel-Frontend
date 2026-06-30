'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import {
  CommunicationLog,
  CommunicationChannel,
  CommunicationStatus,
} from '../types/communication.types';
import { useCommunicationLogs } from '../hooks/useCommunicationLogs';
import { Mail, MessageSquare, Bell, Link2, Calendar, RotateCcw } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface CommunicationLogsTableProps {
  onViewDetails: (log: CommunicationLog) => void;
}

const CHANNEL_CONFIG: Record<
  CommunicationChannel,
  { icon: React.ReactNode; label: string; color: string; bgColor: string }
> = {
  [CommunicationChannel.EMAIL]: {
    icon: <Mail size={14} />,
    label: 'Email',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
  },
  [CommunicationChannel.SMS]: {
    icon: <MessageSquare size={14} />,
    label: 'SMS',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  [CommunicationChannel.PUSH]: {
    icon: <Bell size={14} />,
    label: 'Push',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-500/10',
  },
  [CommunicationChannel.WEBHOOK]: {
    icon: <Link2 size={14} />,
    label: 'Webhook',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-500/10',
  },
};

const STATUS_BADGE_CONFIG: Record<
  CommunicationStatus,
  { text: string; color: 'primary' | 'success' | 'error' | 'warning' | 'info' }
> = {
  [CommunicationStatus.PENDING]: { text: 'Pending', color: 'warning' },
  [CommunicationStatus.SENT]: { text: 'Sent', color: 'success' },
  [CommunicationStatus.FAILED]: { text: 'Failed', color: 'error' },
  [CommunicationStatus.REQUESTED]: { text: 'Requested', color: 'warning' },
  [CommunicationStatus.DELIVERED]: { text: 'Delivered', color: 'success' },
  [CommunicationStatus.OPENED]: { text: 'Opened', color: 'info' },
  [CommunicationStatus.CLICKED]: { text: 'Clicked', color: 'info' },
  [CommunicationStatus.BOUNCED]: { text: 'Bounced', color: 'error' },
  [CommunicationStatus.SPAM]: { text: 'Spam', color: 'error' },
  [CommunicationStatus.BLOCKED]: { text: 'Blocked', color: 'error' },
};

export const CommunicationLogsTable: React.FC<CommunicationLogsTableProps> = ({
  onViewDetails,
}) => {
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    channel?: CommunicationChannel;
    status?: CommunicationStatus;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { logs, meta, isLoading } = useCommunicationLogs(params);

  const columns: Column<CommunicationLog>[] = [
    {
      header: 'Channel',
      accessor: (log) => {
        const cfg = CHANNEL_CONFIG[log.channel];
        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-xl ${cfg.bgColor} ${cfg.color} shadow-sm`}
            >
              {cfg.icon}
            </div>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
              {cfg.label}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Recipient',
      accessor: (log) => (
        <div className="min-w-0 max-w-[200px]">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {log.recipient}
          </p>
          {log.sender && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
              from: {log.sender}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Title',
      accessor: (log) => (
        <div className="max-w-[220px]">
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{log.title || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (log) => {
        const badge = STATUS_BADGE_CONFIG[log.status] || { text: log.status, color: 'primary' };
        return (
          <Badge
            color={badge.color}
            className="flex items-center gap-1 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm"
          >
            {badge.text}
          </Badge>
        );
      },
    },
    {
      header: 'Retries',
      accessor: (log) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <RotateCcw size={12} className="text-gray-400 shrink-0" />
          <span className="font-semibold">{log.retryCount}</span>
        </div>
      ),
    },
    {
      header: 'Sent At',
      accessor: (log) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400 shrink-0" />
          <span>
            {new Date(log.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (log) => (
        <button
          onClick={() => onViewDetails(log)}
          className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 rounded-xl transition-all"
          title="View log details"
        >
          <Mail size={16} />
        </button>
      ),
    },
  ];

  const CHANNEL_OPTIONS = [
    { value: '', label: 'All Channels' },
    { value: CommunicationChannel.EMAIL, label: '📧 Email' },
    { value: CommunicationChannel.SMS, label: '💬 SMS' },
    { value: CommunicationChannel.PUSH, label: '🔔 Push' },
    { value: CommunicationChannel.WEBHOOK, label: '🔗 Webhook' },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: CommunicationStatus.PENDING, label: '⏳ Pending' },
    { value: CommunicationStatus.REQUESTED, label: '📨 Requested' },
    { value: CommunicationStatus.SENT, label: '✅ Sent' },
    { value: CommunicationStatus.DELIVERED, label: '📬 Delivered' },
    { value: CommunicationStatus.OPENED, label: '📖 Opened' },
    { value: CommunicationStatus.CLICKED, label: '🖱️ Clicked' },
    { value: CommunicationStatus.FAILED, label: '❌ Failed' },
    { value: CommunicationStatus.BOUNCED, label: '⚠️ Bounced' },
    { value: CommunicationStatus.SPAM, label: '🚫 Spam' },
    { value: CommunicationStatus.BLOCKED, label: '🔒 Blocked' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-navy-950 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by recipient, title, or content..."
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={params.channel || ''}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                channel: (e.target.value as CommunicationChannel) || undefined,
                page: 1,
              }))
            }
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          >
            {CHANNEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={params.status || ''}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                status: (e.target.value as CommunicationStatus) || undefined,
                page: 1,
              }))
            }
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        isLoading={isLoading}
        serverSide
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      />
    </div>
  );
};
