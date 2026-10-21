'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { FormSubmission, SubmissionStatus, FormFieldType } from '../types/form.types';
import { useFormSubmissions, useFormAnalytics } from '../hooks/useFormSubmissions';
import { useCustomForm } from '../hooks/useCustomForms';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Archive,
  Layers,
  Inbox,
  TrendingUp,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import { ExportButton } from '@/components/common/ExportButton';
import { dataExportService } from '@/services/dataExport.service';
import { PERMISSIONS } from '@/constants/permissions';

interface FormSubmissionsTableProps {
  formId: string;
}

export const FormSubmissionsTable: React.FC<FormSubmissionsTableProps> = ({ formId }) => {
  const router = useRouter();
  const { form } = useCustomForm(formId);
  const { data: analytics } = useFormAnalytics(formId);

  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    status?: SubmissionStatus;
    startDate?: string;
    endDate?: string;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { submissions, meta, isLoading, updateStatus, deleteSubmission } = useFormSubmissions(
    formId,
    params,
  );

  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.REVIEWED:
        return (
          <Badge variant="light" color="success" size="sm">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} />
              Reviewed
            </span>
          </Badge>
        );
      case SubmissionStatus.SPAM:
        return (
          <Badge variant="light" color="error" size="sm">
            <span className="flex items-center gap-1">
              <AlertTriangle size={12} />
              Spam
            </span>
          </Badge>
        );
      case SubmissionStatus.ARCHIVED:
        return (
          <Badge variant="light" color="dark" size="sm">
            <span className="flex items-center gap-1">
              <Archive size={12} />
              Archived
            </span>
          </Badge>
        );
      case SubmissionStatus.NEW:
      default:
        return (
          <Badge variant="light" color="warning" size="sm">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              New
            </span>
          </Badge>
        );
    }
  };

  const handleDelete = async (sub: FormSubmission) => {
    if (window.confirm('Are you sure you want to delete this submission response?')) {
      await deleteSubmission(sub.id);
    }
  };

  const handleQuickStatusChange = async (sub: FormSubmission, newStatus: SubmissionStatus) => {
    await updateStatus({ submissionId: sub.id, status: newStatus });
  };

  const columns: Column<FormSubmission>[] = [
    {
      header: 'Submitter',
      accessor: (sub) => {
        const email =
          sub.submitter?.submitterEmail ||
          sub.answers?.find((a) => a.fieldType === FormFieldType.EMAIL)?.value;
        const phone =
          sub.submitter?.submitterPhone ||
          sub.answers?.find((a) => a.fieldType === FormFieldType.PHONE)?.value;

        return (
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {email ? String(email) : 'Website Visitor'}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {Boolean(phone) && (
                <span className="flex items-center gap-1">
                  <Phone size={11} className="text-gray-400" />
                  {String(phone)}
                </span>
              )}
              {sub.submitter?.ipAddress && (
                <span className="font-mono text-[11px] text-gray-400">
                  {sub.submitter.ipAddress}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Response Summary',
      accessor: (sub) => {
        const answersPreview = (sub.answers || []).slice(0, 2);
        return (
          <div className="space-y-1 max-w-sm">
            {answersPreview.map((ans, idx) => (
              <div key={idx} className="text-xs truncate">
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {ans.questionLabel}:{' '}
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  {Array.isArray(ans.value) ? ans.value.join(', ') : String(ans.value ?? '')}
                </span>
              </div>
            ))}
            {(sub.answers || []).length > 2 && (
              <span className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                +{sub.answers.length - 2} more answers
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (sub) => (
        <div className="flex items-center gap-2">
          {getStatusBadge(sub.status)}
          <select
            value={sub.status}
            onChange={(e) => handleQuickStatusChange(sub, e.target.value as SubmissionStatus)}
            className="text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value={SubmissionStatus.NEW}>New</option>
            <option value={SubmissionStatus.REVIEWED}>Reviewed</option>
            <option value={SubmissionStatus.SPAM}>Spam</option>
            <option value={SubmissionStatus.ARCHIVED}>Archived</option>
          </select>
        </div>
      ),
    },
    {
      header: 'Submitted At',
      accessor: (sub) => (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} className="text-gray-400" />
          {new Date(sub.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (sub) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedSubmission(sub)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
            title="View Full Answers"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(sub)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Delete Submission"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/forms')}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Back to Forms"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {form?.name || 'Form'} Submissions
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Review and export incoming visitor submissions for this form.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/forms/${formId}/builder`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <Layers size={14} />
            <span>Edit Questions</span>
          </Link>
          <ExportButton
            onExport={() => dataExportService.exportFormSubmissions(formId, params)}
            permission={PERMISSIONS.FORM_SUBMISSIONS_EXPORT}
          />
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Submissions</span>
            <Inbox size={16} className="text-brand-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {analytics?.total || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>New (Unreviewed)</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {analytics?.statusBreakdown?.NEW || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Reviewed</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {analytics?.statusBreakdown?.REVIEWED || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Last 7 Days</span>
            <TrendingUp size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {analytics?.totalLast7Days || 0}
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        {/* Status Filter */}
        <select
          value={params.status || ''}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              page: 1,
              status: (e.target.value as SubmissionStatus) || undefined,
            }))
          }
          aria-label="Filter submissions by status"
          className="text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Statuses</option>
          <option value={SubmissionStatus.NEW}>New</option>
          <option value={SubmissionStatus.REVIEWED}>Reviewed</option>
          <option value={SubmissionStatus.SPAM}>Spam</option>
          <option value={SubmissionStatus.ARCHIVED}>Archived</option>
        </select>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={params.startDate || ''}
            onChange={(e) =>
              setParams((prev) => ({ ...prev, page: 1, startDate: e.target.value || undefined }))
            }
            aria-label="Filter submissions starting from date"
            className="text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-700 dark:text-gray-200"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={params.endDate || ''}
            onChange={(e) =>
              setParams((prev) => ({ ...prev, page: 1, endDate: e.target.value || undefined }))
            }
            aria-label="Filter submissions ending at date"
            className="text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Main Submissions Table */}
      <DataTable
        data={submissions}
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
        searchPlaceholder="Search answers or submitter email/phone..."
      />

      {/* Response Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onUpdateStatus={async (newStatus, notes) => {
            await updateStatus({
              submissionId: selectedSubmission.id,
              status: newStatus,
              adminNotes: notes,
            });
            setSelectedSubmission((prev) =>
              prev ? { ...prev, status: newStatus, adminNotes: notes } : null,
            );
          }}
        />
      )}
    </div>
  );
};
