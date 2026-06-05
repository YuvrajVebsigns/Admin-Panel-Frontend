'use client';

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { GroupedNominee, NominationStatus } from '../types/nomination.types';
import { useGroupedNominees } from '../hooks/useNominations';
import { Mail, Briefcase, Award } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface NomineeTableProps {}

export const NomineeTable: React.FC<NomineeTableProps> = () => {
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    status?: NominationStatus;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { nominees, meta, isLoading } = useGroupedNominees(params);

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

  const columns: Column<GroupedNominee>[] = [
    {
      header: 'CIO Nominee',
      accessor: (grouped) => {
        const nominee = grouped.nominee;
        return (
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-sm border border-brand-100 dark:border-brand-500/20">
              {getInitials(nominee.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {nominee.name}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <Mail size={12} className="text-gray-400" />
                {nominee.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Company',
      accessor: (grouped) => {
        const nominee = grouped.nominee;
        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <Briefcase size={14} className="text-gray-400 shrink-0" />
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {nominee.organization || '-'}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Categories',
      accessor: (grouped) => (
        <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
          {grouped.categoryDocs && grouped.categoryDocs.length > 0
            ? grouped.categoryDocs.map((cat, i) => (
                <Badge
                  key={i}
                  color="info"
                  variant="light"
                  startIcon={<Award size={12} />}
                  className="font-medium text-xs rounded-lg px-2 py-1"
                >
                  {cat.name}
                </Badge>
              ))
            : grouped.categories.map((catId, i) => (
                <Badge
                  key={i}
                  color="info"
                  variant="light"
                  startIcon={<Award size={12} />}
                  className="font-medium text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-lg border-none shadow-sm"
                >
                  ID: {catId.substring(0, 8)}
                </Badge>
              ))}
        </div>
      ),
    },
    {
      header: 'Nominators',
      accessor: (grouped) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
            {grouped.nominatorsCount}
          </span>
          <span className="text-xs text-gray-500">Submissions</span>
        </div>
      ),
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
            placeholder="Search nominees by name, email..."
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
        </div>
      </div>

      <DataTable
        data={nominees}
        columns={columns}
        isLoading={isLoading}
        serverSide={true}
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      />
    </div>
  );
};
