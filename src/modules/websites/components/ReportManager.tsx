'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebsiteReports } from '../hooks/useWebsiteReports';
import { Report } from '../types/cms.types';
import { DataTable } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Edit, Trash2, Globe, Lock, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface ReportManagerProps {
  siteId: string;
}

export const ReportManager: React.FC<ReportManagerProps> = ({ siteId }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.roleKey === 'super_admin';

  const { reports, meta, isLoading, updateReport, deleteReport } = useWebsiteReports({
    websiteId: siteId,
    search: search || undefined,
    page,
    limit,
  });

  const handleEdit = (reportItem: Report) => {
    router.push(`/reports/update/${reportItem.id}?from=/websites/dashboard/${siteId}`);
  };

  const handleCreate = () => {
    router.push(`/reports/create?websiteId=${siteId}&from=/websites/dashboard/${siteId}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await deleteReport(id);
      } catch (e) {}
    }
  };

  const handleTogglePublish = async (reportItem: Report) => {
    try {
      await updateReport({
        id: reportItem.id,
        data: { isPublished: !reportItem.isPublished },
      });
    } catch (e) {}
  };

  const columns = [
    {
      header: 'REPORT TITLE',
      accessor: (item: Report) => (
        <div className="flex flex-col">
          <span
            onClick={() => handleEdit(item)}
            className="font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
          >
            {item.title}
          </span>
          <span className="text-xs text-gray-400 font-medium">/{item.slug}</span>
        </div>
      ),
    },
    {
      header: 'DOWNLOAD COUNT',
      accessor: (item: Report) => (
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 text-gray-600 dark:text-gray-300 rounded-md">
          {item.downloadCount || 0} downloads
        </span>
      ),
    },
    {
      header: 'STATUS',
      accessor: (item: Report) => {
        return (
          <Badge color={item.isPublished ? 'success' : 'warning'}>
            {item.isPublished ? 'Published' : 'Draft'}
          </Badge>
        );
      },
    },
    {
      header: 'CREATED AT',
      accessor: (item: Report) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: (item: Report) => (
        <div className="flex items-center gap-1.5">
          {isSuperAdmin && (
            <button
              onClick={() => handleTogglePublish(item)}
              title={item.isPublished ? 'Unpublish Report' : 'Publish Report'}
              className={`p-2 rounded-lg transition-colors border-none bg-transparent ${
                item.isPublished
                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                  : 'text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900'
              }`}
            >
              {item.isPublished ? <Globe size={16} /> : <Lock size={16} />}
            </button>
          )}

          <button
            onClick={() => handleEdit(item)}
            title="Edit Details"
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900 rounded-lg transition-colors border-none bg-transparent"
          >
            <Edit size={16} />
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => handleDelete(item.id)}
              title="Delete Report"
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors border-none bg-transparent"
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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-navy-900/30 p-4 rounded-2xl border border-gray-100 dark:border-navy-700">
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Manage downloadable report assets and view user download analytics.
        </div>
        <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          Create Report
        </Button>
      </div>

      {/* Reports Data Table */}
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
        onSearchChange={setSearch}
        searchPlaceholder="Search reports..."
      />
    </div>
  );
};
