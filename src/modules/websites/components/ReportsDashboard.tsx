'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useWebsiteReports } from '../hooks/useWebsiteReports';
import { useWebsites } from '../hooks/useWebsites';
import { Report } from '../types/cms.types';
import { Website } from '../types/website.types';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Edit, Trash2, Globe, Lock, Plus, FileText, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import { getImageUrl, cn } from '@/lib/utils';

export const ReportsDashboard: React.FC = () => {
  const router = useRouter();
  const { confirm } = useGlobalModal();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.roleKey === 'super_admin';

  // Filters State
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Load Websites
  const { websites } = useWebsites({ limit: 100 });

  // Map websites for fast lookup (logo, name)
  const websiteMap = useMemo(() => {
    const map = new Map<string, Website>();
    websites.forEach((w) => map.set(w.id, w));
    return map;
  }, [websites]);

  // Main Reports Query
  const { reports, meta, isLoading, updateReport, deleteReport } = useWebsiteReports({
    websiteId: selectedWebsiteId || undefined,
    search: search || undefined,
    isPublished:
      statusFilter === 'published' ? 'true' : statusFilter === 'draft' ? 'false' : undefined,
    page,
    limit,
  });

  // Queries for Metrics counts
  const { meta: allMeta } = useWebsiteReports({
    websiteId: selectedWebsiteId || undefined,
    search: search || undefined,
    limit: 1,
  });

  const { meta: publishedMeta } = useWebsiteReports({
    websiteId: selectedWebsiteId || undefined,
    search: search || undefined,
    isPublished: 'true',
    limit: 1,
  });

  const { meta: draftMeta } = useWebsiteReports({
    websiteId: selectedWebsiteId || undefined,
    search: search || undefined,
    isPublished: 'false',
    limit: 1,
  });

  // Actions
  const handleStatusFilterChange = (filter: 'all' | 'published' | 'draft') => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleWebsiteChange = (websiteId: string) => {
    setSelectedWebsiteId(websiteId);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleViewDetails = (reportItem: Report) => {
    router.push(`/reports/${reportItem.id}`);
  };

  const handleEdit = (reportItem: Report) => {
    router.push(`/reports/update/${reportItem.id}?from=/reports`);
  };

  const handleCreate = () => {
    const websiteParam = selectedWebsiteId
      ? `?websiteId=${selectedWebsiteId}&from=/reports`
      : '?from=/reports';
    router.push(`/reports/create${websiteParam}`);
  };

  const handleDelete = (reportItem: Report) => {
    confirm({
      title: 'Delete Report',
      message: `Are you sure you want to delete "${reportItem.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteReport(reportItem.id);
        } catch (e) {}
      },
    });
  };

  const handleTogglePublish = async (reportItem: Report) => {
    try {
      await updateReport({
        id: reportItem.id,
        data: { isPublished: !reportItem.isPublished },
      });
    } catch (e) {}
  };

  const stats = [
    {
      id: 'all',
      name: 'All Reports',
      count: allMeta?.total ?? 0,
      icon: FileText,
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      activeColor:
        'ring-2 ring-brand-500/50 border-brand-500 dark:border-brand-400 bg-brand-500/[0.02] dark:bg-brand-500/[0.05]',
      inactiveColor: 'border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800',
    },
    {
      id: 'published',
      name: 'Published',
      count: publishedMeta?.total ?? 0,
      icon: Globe,
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      activeColor:
        'ring-2 ring-emerald-500/50 border-emerald-500 dark:border-emerald-400 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05]',
      inactiveColor: 'border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800',
    },
    {
      id: 'draft',
      name: 'Drafts',
      count: draftMeta?.total ?? 0,
      icon: Lock,
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
      activeColor:
        'ring-2 ring-amber-500/50 border-amber-500 dark:border-amber-400 bg-amber-500/[0.02] dark:bg-amber-500/[0.05]',
      inactiveColor: 'border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800',
    },
  ];

  const columns: Column<Report>[] = [
    {
      header: 'S.NO',
      accessor: (_, rowIndex) => {
        const itemNumber = (page - 1) * limit + rowIndex + 1;
        return (
          <div className="text-sm font-bold text-gray-500 dark:text-gray-400 pl-2">
            {itemNumber < 10 ? `0${itemNumber}` : itemNumber}
          </div>
        );
      },
      className: 'w-[60px]',
    },
    {
      header: 'TARGET WEBSITE',
      accessor: (reportItem) => {
        const website = websiteMap.get(reportItem.websiteId || '');
        if (!website) {
          return (
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-navy-900 text-gray-500 dark:text-gray-400 rounded-md">
              Global
            </span>
          );
        }
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center border border-brand-100 dark:border-brand-500/20">
              {getImageUrl(website.logo) ? (
                <Image
                  src={getImageUrl(website.logo)}
                  alt={website.name}
                  fill
                  sizes="32px"
                  className="object-contain p-1.5"
                />
              ) : (
                <Globe className="w-4 h-4 text-brand-500" />
              )}
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
              {website.name}
            </span>
          </div>
        );
      },
    },
    {
      header: 'REPORT TITLE',
      accessor: (reportItem) => (
        <div className="flex flex-col max-w-[320px]">
          <span
            onClick={() => handleEdit(reportItem)}
            className="font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer truncate"
          >
            {reportItem.title}
          </span>
          <span className="text-xs text-gray-400 font-medium truncate">/{reportItem.slug}</span>
        </div>
      ),
    },
    {
      header: 'DOWNLOADS',
      accessor: (reportItem) => (
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 text-gray-600 dark:text-gray-300 rounded-md">
          {reportItem.downloadCount || 0} downloads
        </span>
      ),
    },
    {
      header: 'STATUS',
      accessor: (reportItem) => (
        <Badge color={reportItem.isPublished ? 'success' : 'warning'}>
          {reportItem.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      header: 'CREATED AT',
      accessor: (reportItem) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date(reportItem.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: (reportItem) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleViewDetails(reportItem)}
            title="View Details"
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <Eye size={16} />
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => handleTogglePublish(reportItem)}
              title={reportItem.isPublished ? 'Unpublish Report' : 'Publish Report'}
              className={`p-2 rounded-lg transition-colors border-none bg-transparent cursor-pointer ${
                reportItem.isPublished
                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                  : 'text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900'
              }`}
            >
              {reportItem.isPublished ? <Globe size={16} /> : <Lock size={16} />}
            </button>
          )}

          <button
            onClick={() => handleEdit(reportItem)}
            title="Edit Details"
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          >
            <Edit size={16} />
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => handleDelete(reportItem)}
              title="Delete Report"
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Section with Tab Filtering */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isActive = statusFilter === stat.id;
          return (
            <button
              key={stat.id}
              onClick={() => handleStatusFilterChange(stat.id as 'all' | 'published' | 'draft')}
              className={cn(
                'flex items-center justify-between p-6 rounded-2xl border text-left transition-all duration-300 outline-none cursor-pointer',
                isActive ? stat.activeColor : stat.inactiveColor,
                'hover:shadow-md hover:border-gray-300 dark:hover:border-navy-600',
              )}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {stat.name}
                </span>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                  {stat.count}
                </h3>
              </div>
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                  stat.bgColor,
                )}
              >
                <Icon size={24} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-gray-100 dark:border-navy-700">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Target Website Filter */}
          <div className="relative w-full sm:w-[220px]">
            <select
              value={selectedWebsiteId}
              onChange={(e) => handleWebsiteChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white font-medium"
            >
              <option value="">All Websites</option>
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action button */}
        <div className="w-full md:w-auto flex justify-end">
          <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto">
            <Plus size={18} className="mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800">
        <DataTable<Report>
          data={reports}
          columns={columns}
          isLoading={isLoading}
          serverSide={true}
          totalItems={meta?.total || 0}
          page={page}
          limit={limit}
          search={search}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search reports..."
        />
      </div>
    </div>
  );
};
