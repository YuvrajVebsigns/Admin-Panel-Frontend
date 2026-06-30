'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { WebhookSubscription } from '../types/communication.types';
import { useWebhookSubscriptions } from '../hooks/useWebhookSubscriptions';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import { Pencil, Trash2, Calendar, Link2, ExternalLink } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface WebhookSubscriptionsTableProps {
  onEdit: (webhook: WebhookSubscription) => void;
}

export const WebhookSubscriptionsTable: React.FC<WebhookSubscriptionsTableProps> = ({ onEdit }) => {
  const { confirm } = useGlobalModal();
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    isActive?: boolean;
  }>({ page: 1, limit: 10, search: '' });

  const { webhooks, meta, isLoading, deleteWebhook } = useWebhookSubscriptions(params);

  const handleDelete = (webhook: WebhookSubscription) => {
    confirm({
      title: 'Delete Webhook Subscription',
      message: `Are you sure you want to delete the webhook for "${webhook.url}"?`,
      confirmText: 'Delete Subscription',
      type: 'danger',
      onConfirm: async () => {
        await deleteWebhook(webhook.id);
      },
    });
  };

  const columns: Column<WebhookSubscription>[] = [
    {
      header: 'Webhook URL',
      accessor: (w) => (
        <div className="flex items-center gap-2.5 min-w-0 max-w-[260px]">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm shrink-0">
            <Link2 size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{w.url}</p>
            <a
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-brand-500 hover:text-brand-600 flex items-center gap-0.5 mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} /> Open
            </a>
          </div>
        </div>
      ),
    },
    {
      header: 'Events',
      accessor: (w) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {w.events.slice(0, 3).map((evt) => (
            <span
              key={evt}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-navy-300"
            >
              {evt}
            </span>
          ))}
          {w.events.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
              +{w.events.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (w) => (
        <Badge
          color={w.isActive ? 'success' : 'light'}
          className="font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm"
        >
          {w.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Created At',
      accessor: (w) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400 shrink-0" />
          <span>
            {new Date(w.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (w) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(w)}
            className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 rounded-xl transition-all"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(w)}
            className="p-2 text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-xl transition-all"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const ACTIVE_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'true', label: '✅ Active' },
    { value: 'false', label: '⏸ Inactive' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-navy-950 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by webhook URL..."
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={params.isActive === undefined ? '' : params.isActive.toString()}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              }))
            }
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
          >
            {ACTIVE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DataTable
        data={webhooks}
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
