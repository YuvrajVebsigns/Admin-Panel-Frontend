'use client';

import React, { Suspense } from 'react';
import { ReportsDashboard } from '@/modules/websites/components/ReportsDashboard';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          Reports Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Manage downloadable report assets and view user download analytics.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-sm font-medium text-gray-500 animate-pulse">
              Loading reports dashboard...
            </p>
          </div>
        }
      >
        <ReportsDashboard />
      </Suspense>
    </div>
  );
}
