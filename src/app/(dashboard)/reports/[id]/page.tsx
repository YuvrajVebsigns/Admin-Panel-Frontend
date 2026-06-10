'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  useWebsiteReport,
  useWebsiteReportDownloaders,
} from '@/modules/websites/hooks/useWebsiteReports';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import { ArrowLeft, Loader2, FileText, Calendar, Download } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { ReportDownloader } from '@/modules/websites/types/cms.types';
import { Website } from '@/modules/websites/types/website.types';

export default function ReportDetailsPage() {
  const params = useParams();
  const reportId = params?.id as string;

  // Fetch Report info
  const { report, isLoading: isReportLoading, error: reportError } = useWebsiteReport(reportId);

  // Fetch Downloaders logs
  const { downloaders, isLoading: isDownloadersLoading } = useWebsiteReportDownloaders(reportId);

  // Fetch Websites to map websiteId to name/logo
  const { websites } = useWebsites({ limit: 100 });
  const websiteMap = useMemo(() => {
    const map = new Map<string, Website>();
    websites.forEach((w) => map.set(w.id, w));
    return map;
  }, [websites]);

  const targetWebsite = report?.websiteId ? websiteMap.get(report.websiteId) : null;

  const columns: Column<ReportDownloader>[] = [
    {
      header: 'S.NO',
      accessor: (_, rowIndex) => (
        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 pl-2">
          {rowIndex < 10 ? `0${rowIndex}` : rowIndex}
        </div>
      ),
      className: 'w-[60px]',
    },
    {
      header: 'NAME',
      accessor: (item) => (
        <div className="font-bold text-gray-900 dark:text-white text-sm">
          {item.name || `${item.firstName} ${item.lastName}`.trim() || 'Anonymous'}
        </div>
      ),
    },
    {
      header: 'EMAIL',
      accessor: (item) => (
        <div className="font-medium text-gray-700 dark:text-gray-300 text-sm">{item.email}</div>
      ),
    },
    {
      header: 'PHONE',
      accessor: (item) => {
        if (!item.phoneNumber) return <span className="text-gray-400">-</span>;
        return (
          <span className="text-xs font-semibold px-2 py-1 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 text-gray-600 dark:text-gray-300 rounded-md">
            {item.countryCode ? `${item.countryCode} ` : ''}
            {item.phoneNumber}
          </span>
        );
      },
    },
    {
      header: 'COMPANY / ROLE',
      accessor: (item) => {
        if (!item.companyName && !item.designation) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {item.companyName || '-'}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {[item.designation, item.industry].filter(Boolean).join(' • ')}
            </span>
          </div>
        );
      },
    },
    {
      header: 'DOWNLOADED AT',
      accessor: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date(item.downloadedAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      ),
    },
  ];

  if (isReportLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading report details...</p>
      </div>
    );
  }

  if (reportError || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <p className="text-lg font-bold text-red-500">Failed to load report or report not found.</p>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:underline"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/reports"
        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-brand-500 transition-colors gap-1.5"
      >
        <ArrowLeft size={16} />
        Back to Reports
      </Link>

      {/* Report Summary Card */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-xl">
              <FileText size={32} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">
                  {report.title}
                </h1>
                <Badge color={report.isPublished ? 'success' : 'warning'}>
                  {report.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-400">
                Slug:{' '}
                <code className="bg-gray-50 dark:bg-navy-900 px-1.5 py-0.5 rounded text-xs text-brand-500">
                  /{report.slug}
                </code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Total Download Badge */}
            <div className="bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg">
                <Download size={18} />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Downloads
                </div>
                <div className="text-lg font-black text-gray-900 dark:text-white">
                  {report.downloadCount ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-navy-700 text-sm">
          <div className="space-y-1">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
              Target Website
            </div>
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {targetWebsite ? (
                <>
                  {getImageUrl(targetWebsite.logo) && (
                    <div className="relative w-5 h-5 rounded-full overflow-hidden bg-white">
                      <Image
                        src={getImageUrl(targetWebsite.logo)}
                        alt={targetWebsite.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span>{targetWebsite.name}</span>
                </>
              ) : (
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-navy-700 text-gray-500 rounded">
                  Global
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
              Created At
            </div>
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span>
                {new Date(report.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">
              Report ID
            </div>
            <div className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate">
              {report.id}
            </div>
          </div>
        </div>

        {report.description && (
          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <div className="text-gray-400 font-bold uppercase tracking-wider text-[11px] mb-2">
              Description
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-navy-900/40 p-4 rounded-xl">
              {report.description}
            </p>
          </div>
        )}
      </div>

      {/* Downloaders List Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
            Download Analytics Logs
          </h2>
          <p className="text-xs text-gray-500">
            List of all users who requested and downloaded this report asset.
          </p>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800">
          <DataTable<ReportDownloader>
            data={downloaders}
            columns={columns}
            isLoading={isDownloadersLoading}
            searchPlaceholder="Search downloaders..."
          />
        </div>
      </div>
    </div>
  );
}
