'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Registree } from '../types/registree.types';
import { useRegistrees, useDeleteRegistree } from '../hooks/useRegistrees';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import {
  Trash2,
  User,
  Users,
  Calendar,
  Eye,
  Award,
  Briefcase,
  FileDown,
  Globe,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import toast from 'react-hot-toast';
import { ExportButton } from '@/components/common/ExportButton';
import { dataExportService } from '@/services/dataExport.service';
import { PERMISSIONS } from '@/constants/permissions';

const TAG_OPTIONS = [
  { value: '', label: 'All User Sources' },
  { value: 'sponsor', label: 'Event Sponsors' },
  { value: 'delegate', label: 'Event Delegates' },
  { value: 'speaker', label: 'Event Speakers' },
  { value: 'nominator', label: 'Nominators' },
  { value: 'nominee', label: 'Nominees' },
  { value: 'enquiry', label: 'General Inquiries' },
];

export const UserManagementTable: React.FC = () => {
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    tag?: string;
    websiteId?: string;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isLoading } = useRegistrees(params);
  const { websites } = useWebsites();
  const deleteMutation = useDeleteRegistree();

  const totalItems = data?.meta?.total || 0;

  // Load aggregate dataset for statistics
  const { data: allStatsData } = useRegistrees({ limit: 1000 });
  const allRegistrees = allStatsData?.data || [];

  const stats = React.useMemo(() => {
    const total = allRegistrees.length;
    const withEvents = allRegistrees.filter((r) => r.eventIds && r.eventIds.length > 0).length;
    const sponsors = allRegistrees.filter(
      (r) => r.tags && r.tags.some((t) => t.toLowerCase().includes('sponsor')),
    ).length;
    const nominations = allRegistrees.filter(
      (r) =>
        r.tags &&
        r.tags.some(
          (t) => t.toLowerCase().includes('nominator') || t.toLowerCase().includes('nominee'),
        ),
    ).length;
    const downloaders = allRegistrees.filter(
      (r) =>
        r.tags &&
        r.tags.some(
          (t) => t.toLowerCase().includes('downloader') || t.toLowerCase().includes('report'),
        ),
    ).length;

    return { total, withEvents, sponsors, nominations, downloaders };
  }, [allRegistrees]);

  const handleDelete = async (registree: Registree) => {
    if (confirm(`Are you sure you want to delete user "${registree.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(registree.id);
        toast.success('User deleted successfully');
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  const getTagBadgeColor = (
    tag: string,
  ): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' => {
    const t = tag.toLowerCase();
    if (t.includes('sponsor')) return 'warning';
    if (t.includes('speaker')) return 'info';
    if (t.includes('delegate') || t.includes('registree')) return 'primary';
    if (t.includes('nominator')) return 'info';
    if (t.includes('nominee')) return 'success';
    if (t.includes('cxo')) return 'error';
    return 'dark';
  };

  const columns: Column<Registree>[] = [
    {
      header: 'User Profile',
      accessor: (registree) => (
        <div className="flex items-center gap-3.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-navy-800 bg-gray-50 dark:bg-navy-900/50 flex items-center justify-center text-gray-500 shadow-sm">
            <User size={20} className="text-gray-400 dark:text-navy-500" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/users/${registree.id}/view`}
              className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors truncate block"
            >
              {registree.name}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{registree.email}</p>
            {registree.personalEmail && (
              <p className="text-[11px] text-gray-400 dark:text-navy-400 truncate">
                Alt: {registree.personalEmail}
              </p>
            )}
            {registree.phoneNumber && (
              <p className="text-[11px] text-gray-400 dark:text-navy-400">
                {registree.countryCode ? `${registree.countryCode} ` : ''}
                {registree.phoneNumber}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Organization & Role',
      accessor: (registree) => (
        <div className="min-w-0 max-w-[200px]">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {registree.organization || '—'}
          </p>
          {registree.jobTitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {registree.jobTitle}
            </p>
          )}
          {registree.industryVertical && (
            <span className="inline-block text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-navy-900 text-gray-600 dark:text-gray-300 font-medium mt-0.5">
              {registree.industryVertical}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Source / Tags',
      accessor: (registree) => {
        const tags = registree.tags || [];
        if (tags.length === 0) {
          return (
            <Badge color="light" variant="light">
              General
            </Badge>
          );
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[180px]">
            {tags.map((t, idx) => (
              <Badge key={idx} color={getTagBadgeColor(t)} variant="light">
                {t}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      header: 'Events Registered',
      accessor: (registree) => {
        const eventCount = registree.eventIds?.length || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <Calendar size={14} />
            </div>
            <span className="text-sm font-bold text-gray-800 dark:text-white">{eventCount}</span>
          </div>
        );
      },
    },
    {
      header: 'Location',
      accessor: (registree) => {
        const loc = [registree.city, registree.state, registree.country].filter(Boolean).join(', ');
        return (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate max-w-[140px] block">
            {loc || '—'}
          </span>
        );
      },
    },
    {
      header: 'Website Source',
      accessor: (registree) => {
        const ws = registree.websiteId;
        if (!ws) return <span className="text-xs text-gray-400">—</span>;
        const name = typeof ws === 'object' ? ws.name : ws;
        return (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <Globe size={13} className="text-gray-400" />
            {name}
          </span>
        );
      },
    },
    {
      header: 'Joined',
      accessor: (registree) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {registree.joinedAt || registree.createdAt
            ? new Date(registree.joinedAt || registree.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Unknown'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (registree) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/users/${registree.id}/view`}
            title="View User Details"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-indigo-500 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all hover:scale-105"
          >
            <Eye size={16} />
          </Link>

          <button
            onClick={() => handleDelete(registree)}
            title="Delete User"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-red-500 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-all hover:scale-105"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Aggregate KPI Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Total CRM Users
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.total}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Event Registrants
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.withEvents}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Sponsors & Partners
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.sponsors}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nominations</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.nominations}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <FileDown size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Report Downloads
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.downloaders}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Custom Filter Bar */}
      <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl p-5 shadow-theme-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Tag / Source Filter dropdown */}
          <div className="flex flex-col min-w-[200px] w-full sm:w-auto">
            <select
              value={params.tag || ''}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  tag: e.target.value || undefined,
                }))
              }
              className="w-full appearance-none bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-500 transition-all dark:text-white cursor-pointer"
            >
              {TAG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Website Filter dropdown */}
          <div className="flex flex-col min-w-[200px] w-full sm:w-auto">
            <select
              value={params.websiteId || ''}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  websiteId: e.target.value || undefined,
                }))
              }
              className="w-full appearance-none bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-500 transition-all dark:text-white cursor-pointer"
            >
              <option value="">All Websites</option>
              {websites.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ExportButton
          permission={PERMISSIONS.REGISTRATIONS_EXPORT}
          exportTitle="Export All Platform Users"
          exportDescription="Generate a master Excel spreadsheet containing all users across events, sponsorships, nominations, and report downloads."
          customFilters={[
            {
              key: 'tag',
              label: 'User Source / Tag',
              placeholder: 'All User Sources',
              options: TAG_OPTIONS.filter((opt) => opt.value !== '').map((opt) => ({
                value: opt.value,
                label: opt.label,
              })),
            },
            {
              key: 'websiteId',
              label: 'Origin Website',
              placeholder: 'All Websites',
              options: websites.map((ws) => ({
                value: ws.id,
                label: ws.name,
              })),
            },
          ]}
          sheetsInfo={[
            {
              sheet: 'Sheet 1: Analytics Summary',
              desc: 'KPI cards with total users, event registrations, and breakdown.',
            },
            {
              sheet: 'Sheet 2: Registrees Directory',
              desc: 'Master directory with full profile, personal/official email, phone, organization, and tags.',
            },
          ]}
          initialFilters={{
            search: params.search,
            tag: params.tag,
            websiteId: params.websiteId,
          }}
          onExport={(filters) => dataExportService.exportRegistrees(filters)}
        />
      </div>

      {/* Main DataTable */}
      <DataTable<Registree>
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        serverSide={true}
        totalItems={totalItems}
        page={params.page}
        limit={params.limit}
        search={params.search}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) => setParams((prev) => ({ ...prev, limit, page: 1 }))}
        onSearchChange={(search) => setParams((prev) => ({ ...prev, search, page: 1 }))}
        searchPlaceholder="Search all users by name, email, organization, city, tags..."
      />
    </div>
  );
};
