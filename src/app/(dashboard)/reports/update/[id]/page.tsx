'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ReportForm } from '@/modules/websites/components/ReportForm';
import { useWebsiteReport, useWebsiteReports } from '@/modules/websites/hooks/useWebsiteReports';
import { Report } from '@/modules/websites/types/cms.types';
import { Loader2 } from 'lucide-react';

function UpdateReportContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const from = searchParams.get('from');

  const { report, isLoading } = useWebsiteReport(id);
  const { updateReport, isUpdating } = useWebsiteReports({});

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading report details...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Report Not Found</h2>
        <p className="text-gray-500 max-w-xs">
          The report you are trying to edit may have been deleted or the ID is invalid.
        </p>
      </div>
    );
  }

  const backUrl =
    from || (report.websiteId ? `/websites/dashboard/${report.websiteId}` : '/websites');

  const handleSubmit = async (data: Partial<Report>) => {
    await updateReport({ id, data });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          Edit Report Details
        </h1>
        <p className="text-sm text-gray-500">
          Modify details, publication status, or documents attached to the report.
        </p>
      </div>

      <ReportForm
        initialData={report}
        onSubmitReport={handleSubmit}
        isSubmitting={isUpdating}
        backUrl={backUrl}
      />
    </div>
  );
}

export default function UpdateReportPage() {
  return (
    <div className="animate-fade-in">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[30vh]">
            <p className="text-sm font-medium text-gray-500 animate-pulse">Loading editor...</p>
          </div>
        }
      >
        <UpdateReportContent />
      </Suspense>
    </div>
  );
}
