'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative">
        <h1 className="text-[12rem] md:text-[16rem] font-black text-brand-50 dark:text-brand-500/10 animate-pulse select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">Lost in Space?</p>
        </div>
      </div>

      <div className="mt-8 max-w-md">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          The page you are looking for doesn&apos;t exist.
        </h2>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          It looks like you took a wrong turn or the link is broken. Let&apos;s get you back on
          track.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-brand-500 rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
        >
          <Home size={18} />
          Return to Dashboard
        </Link>

        <button
          onClick={() => typeof window !== 'undefined' && window.history.back()}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-navy-700 transition-all active:scale-[0.98]"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    </div>
  );
}
