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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="text-amber-500" size={40} />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Something went wrong in the Dashboard
      </h2>

      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        We encountered an unexpected error while rendering this part of the dashboard. This might be
        due to a temporary connection issue or a data mapping error.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98]"
        >
          <RefreshCw size={18} />
          Try Again
        </button>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
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
