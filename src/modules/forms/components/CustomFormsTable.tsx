'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { CustomForm, FormStatus } from '../types/form.types';
import { useCustomForms } from '../hooks/useCustomForms';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Website } from '@/modules/websites/types/website.types';
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Archive,
  Globe,
  Calendar,
  Layers,
  Inbox,
  Share2,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { ExportButton } from '@/components/common/ExportButton';
import { dataExportService } from '@/services/dataExport.service';
import { PERMISSIONS } from '@/constants/permissions';
import toast from 'react-hot-toast';

export const CustomFormsTable: React.FC = () => {
  const router = useRouter();
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    status?: FormStatus;
    websiteId?: string;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { forms, meta, isLoading, deleteForm, updateStatus, duplicateForm, isDuplicating } =
    useCustomForms(params);
  const { websites } = useWebsites({ limit: 100 });

  const getStatusBadge = (status: FormStatus) => {
    switch (status) {
      case FormStatus.PUBLISHED:
        return (
          <Badge variant="light" color="success" size="sm">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} />
              Published
            </span>
          </Badge>
        );
      case FormStatus.ARCHIVED:
        return (
          <Badge variant="light" color="error" size="sm">
            <span className="flex items-center gap-1">
              <Archive size={12} />
              Archived
            </span>
          </Badge>
        );
      case FormStatus.DRAFT:
      default:
        return (
          <Badge variant="light" color="warning" size="sm">
            Draft
          </Badge>
        );
    }
  };

  const handleCopyPublicUrl = (form: CustomForm) => {
    const websiteDomain =
      typeof form.websiteId === 'object' && form.websiteId?.domain
        ? form.websiteId.domain
        : window.location.host;
    const url = `https://${websiteDomain}/forms/${form.slug}`;
    navigator.clipboard.writeText(url);
    toast.success(`Copied public URL: ${url}`);
  };

  const handleDelete = async (form: CustomForm) => {
    if (
      window.confirm(
        `Are you sure you want to delete form "${form.name}"? Submissions will also be soft-deleted.`,
      )
    ) {
      await deleteForm(form.id);
    }
  };

  const handleStatusChange = async (form: CustomForm, newStatus: FormStatus) => {
    await updateStatus({ id: form.id, status: newStatus });
  };

  const handleDuplicate = async (form: CustomForm) => {
    await duplicateForm(form.id);
  };

  const columns: Column<CustomForm>[] = [
    {
      header: 'Form Details',
      accessor: (form) => (
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-sm border border-brand-100 dark:border-brand-500/20">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <Link
              href={`/forms/${form.id}/builder`}
              className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate block"
            >
              {form.name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                /{form.slug}
              </span>
              <button
                type="button"
                onClick={() => handleCopyPublicUrl(form)}
                className="text-gray-400 hover:text-brand-600 transition-colors p-0.5"
                title="Copy public link"
              >
                <Share2 size={12} />
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Website / Tenancy',
      accessor: (form) => {
        const website = typeof form.websiteId === 'object' ? form.websiteId : null;
        return (
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {website?.name || 'Assigned Website'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Questions',
      accessor: (form) => (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Layers size={14} className="text-brand-500" />
          <span>{form.questions?.length || 0} fields</span>
        </div>
      ),
    },
    {
      header: 'Submissions',
      accessor: (form) => (
        <Link
          href={`/forms/${form.id}/submissions`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <Inbox size={14} />
          <span>{form.submissionCount || 0}</span>
        </Link>
      ),
    },
    {
      header: 'Status',
      accessor: (form) => (
        <div className="flex items-center gap-2">
          {getStatusBadge(form.status)}
          <select
            value={form.status}
            onChange={(e) => handleStatusChange(form, e.target.value as FormStatus)}
            className="text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value={FormStatus.DRAFT}>Draft</option>
            <option value={FormStatus.PUBLISHED}>Published</option>
            <option value={FormStatus.ARCHIVED}>Archived</option>
          </select>
        </div>
      ),
    },
    {
      header: 'Created Date',
      accessor: (form) => (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400" />
          {new Date(form.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (form) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/forms/${form.id}/builder`}
            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
            title="Edit Form & Questions"
          >
            <Edit size={16} />
          </Link>
          <Link
            href={`/forms/${form.id}/submissions`}
            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
            title="View Responses"
          >
            <Eye size={16} />
          </Link>
          <button
            type="button"
            disabled={isDuplicating}
            onClick={() => handleDuplicate(form)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            title="Duplicate Form"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(form)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Delete Form"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Action Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Website Filter */}
          <select
            value={params.websiteId || ''}
            onChange={(e) =>
              setParams((prev) => ({
                ...prev,
                page: 1,
                websiteId: e.target.value || undefined,
              }))
            }
            aria-label="Filter by website"
            className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Websites</option>
            {websites.map((w: Website) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={params.status || ''}
            onChange={(e) =>
              setParams((prev) => ({
                ...prev,
                page: 1,
                status: (e.target.value as FormStatus) || undefined,
              }))
            }
            aria-label="Filter by form status"
            className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value={FormStatus.DRAFT}>Draft</option>
            <option value={FormStatus.PUBLISHED}>Published</option>
            <option value={FormStatus.ARCHIVED}>Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton
            onExport={() => dataExportService.exportForms(params)}
            permission={PERMISSIONS.FORMS_EXPORT}
          />
          <button
            type="button"
            onClick={() => router.push('/forms/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus size={18} />
            <span>Create Form</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        data={forms}
        columns={columns}
        isLoading={isLoading}
        serverSide
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        onPageChange={(page: number) => setParams((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit: number) => setParams((prev) => ({ ...prev, limit, page: 1 }))}
        search={params.search}
        onSearchChange={(search: string) => setParams((prev) => ({ ...prev, search, page: 1 }))}
        searchPlaceholder="Search forms by name, slug or description..."
      />
    </div>
  );
};
