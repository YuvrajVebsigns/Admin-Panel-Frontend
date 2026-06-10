'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportForm } from '@/modules/websites/components/ReportForm';
import { useWebsiteReports } from '@/modules/websites/hooks/useWebsiteReports';
import { Report } from '@/modules/websites/types/cms.types';

function CreateReportContent() {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get('websiteId');
  const from = searchParams.get('from');

  const backUrl = from || (websiteId ? `/websites/dashboard/${websiteId}` : '/websites');

  // We only need mutations from the hook. The hook params don't matter for creation.
  const { createReport, isCreating } = useWebsiteReports({});

  const handleSubmit = async (data: Partial<Report>) => {
    await createReport(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          Create New Report
        </h1>
        <p className="text-sm text-gray-500">
          Publish a new document report resource for the website property.
        </p>
      </div>

      <ReportForm
        onSubmitReport={handleSubmit}
        isSubmitting={isCreating}
        defaultWebsiteId={websiteId}
        backUrl={backUrl}
      />
    </div>
  );
}

export default function CreateReportPage() {
  return (
    <div className="animate-fade-in">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[30vh]">
            <p className="text-sm font-medium text-gray-500 animate-pulse">
              Loading form details...
            </p>
          </div>
        }
      >
        <CreateReportContent />
      </Suspense>
    </div>
  );
}
