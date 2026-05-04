'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a production app, log this error to an error reporting service
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-navy-950 text-center">
      <div className="relative">
        <h1 className="text-[12rem] md:text-[16rem] font-black text-brand-50 dark:text-brand-500/10 animate-pulse uppercase select-none">
          Err
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center">
            <svg
              className="h-10 w-10 text-brand-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Something went wrong!</h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-brand-500 rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
