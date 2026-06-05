'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { GroupedNominator, NominationStatus } from '../types/nomination.types';
import { useGroupedNominators } from '../hooks/useNominations';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Website } from '@/modules/websites/types/website.types';
import { Globe, Calendar, Mail, Eye } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

import { useRouter } from 'next/navigation';

interface NominatorTableProps {}

export const NominatorTable: React.FC<NominatorTableProps> = () => {
  const router = useRouter();
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    status?: NominationStatus;
    websiteId?: string;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { nominators, meta, isLoading } = useGroupedNominators(params);
  const { websites } = useWebsites({ limit: 100 });

  const getStatusColor = (
    status: NominationStatus,
  ): 'warning' | 'success' | 'primary' | 'error' | 'info' | 'light' | 'dark' => {
    switch (status) {
      case NominationStatus.APPROVED:
        return 'success';
      case NominationStatus.REJECTED:
        return 'error';
      case NominationStatus.REVIEWED:
        return 'primary';
      case NominationStatus.PENDING:
      default:
        return 'warning';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0]?.[0];
      const last = parts[parts.length - 1]?.[0];
      if (first && last) {
        return (first + last).toUpperCase();
      }
    }
    const first = parts[0]?.[0];
    return first ? first.toUpperCase() : '?';
  };

  const columns: Column<GroupedNominator>[] = [
    {
      header: 'Nominator Person',
      accessor: (grouped) => {
        const nominator = grouped.nominator;
        return (
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-sm border border-brand-100 dark:border-brand-500/20">
              {getInitials(nominator.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {nominator.name}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <Mail size={12} className="text-gray-400" />
                {nominator.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Company / Location',
      accessor: (grouped) => {
        const nominator = grouped.nominator;
        return (
          <div className="max-w-[200px]">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {nominator.organization || '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {nominator.city || '-'}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Nominees',
      accessor: (grouped) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-600 font-bold text-xs dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
            {grouped.nomineesCount}
          </span>
          <span className="text-xs text-gray-500">CIOs</span>
        </div>
      ),
    },
    {
      header: 'Website Source',
      accessor: (grouped) => {
        const website = grouped.website;
        return (
          <div className="min-w-0">
            {website ? (
              <>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {website.name}
                </p>
                <span className="text-xs text-brand-500 font-medium truncate flex items-center gap-0.5 mt-0.5">
                  <Globe size={12} />
                  {website.domain}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Manual / Admin</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (grouped) => (
        <div className="flex flex-wrap items-center gap-1.5 max-w-[150px]">
          {grouped.statuses.map((status, i) => (
            <Badge
              key={i}
              color={getStatusColor(status)}
              className="flex items-center gap-1 font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-lg border-none shadow-sm"
            >
              {status}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Latest Submission',
      accessor: (grouped) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400 shrink-0" />
          <span>
            {new Date(grouped.submittedAt).toLocaleDateString(undefined, {
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
      accessor: (grouped) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const routeId =
                grouped.nominator?.id || grouped.nominator?._id || grouped.id || grouped._id;
              router.push(`/nominators/${routeId}`);
            }}
            className="p-2 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-xl transition-all"
            title="View details"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: NominationStatus.PENDING, label: 'Pending' },
    { value: NominationStatus.REVIEWED, label: 'Reviewed' },
    { value: NominationStatus.APPROVED, label: 'Approved' },
    { value: NominationStatus.REJECTED, label: 'Rejected' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-navy-950 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search nominators by name, email, or company..."
            value={params.search}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={params.status || ''}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                status: (e.target.value as NominationStatus) || undefined,
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

          <select
            value={params.websiteId || ''}
            onChange={(e) =>
              setParams((p) => ({ ...p, websiteId: e.target.value || undefined, page: 1 }))
            }
            className="px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer max-w-[200px]"
          >
            <option value="">All Websites</option>
            {websites.map((w: Website) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={nominators}
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
