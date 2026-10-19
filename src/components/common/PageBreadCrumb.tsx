import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  pageTitle: string;
}

export default function PageBreadcrumb({ pageTitle }: BreadcrumbProps) {
  return (
    <div className="mb-7 flex min-w-0 flex-col gap-3 border-b border-navy-100 pb-6 dark:border-navy-800 sm:flex-row sm:items-end sm:justify-between">
      <div className="admin-section-heading min-w-0">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-navy-400">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
          Workspace
        </p>
        <h1 className="text-2xl font-semibold leading-tight text-navy-900 dark:text-white sm:text-3xl">
          {pageTitle}
        </h1>
      </div>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-navy-500 dark:text-navy-300">
          <li>
            <Link
              className="admin-action inline-flex min-h-11 items-center rounded-lg px-1 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-safe:transition-colors dark:hover:text-brand-300"
              href="/"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li aria-current="page" className="text-navy-700 dark:text-navy-100">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
}
