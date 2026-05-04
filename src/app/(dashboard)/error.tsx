'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative">
        <h1 className="text-[12rem] md:text-[16rem] font-black text-brand-50 dark:text-brand-500/10 animate-pulse uppercase select-none">
          Err
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-brand-500" size={40} />
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Something went wrong in the Dashboard
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          We encountered an unexpected error. This might be due to a temporary connection issue or a
          data mapping error.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-brand-500 rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
        >
          <RefreshCw size={18} />
          Try Again
        </button>

        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-navy-700 transition-all active:scale-[0.98]"
        >
          Refresh Page
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-10 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl text-left w-full overflow-auto max-h-40">
          <p className="text-xs font-mono text-red-500 uppercase mb-2">Error Details:</p>
          <pre className="text-xs font-mono text-gray-600 dark:text-gray-400">{error.message}</pre>
        </div>
      )}
    </div>
  );
}
