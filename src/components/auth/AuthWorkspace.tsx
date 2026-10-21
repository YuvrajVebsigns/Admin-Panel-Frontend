import React from 'react';
import { Loader2 } from 'lucide-react';

export const authInputClassName =
  'min-h-12 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 dark:border-navy-600 dark:bg-navy-900 dark:text-white';
export const authButtonClassName =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-navy-800';
export const authLinkClassName =
  'inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400';

export function AuthWorkspace({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-md">
      {title && (
        <header className="mb-7">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Administration
          </p>
          <h1 className="font-roboto text-2xl font-semibold leading-tight text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </div>
  );
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm leading-relaxed text-error-700 dark:border-error-500/25 dark:bg-error-500/10 dark:text-error-300"
    >
      {children}
    </div>
  );
}

export function AuthLoading() {
  return (
    <div
      className="mx-auto flex min-h-64 w-full max-w-md items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400"
      role="status"
    >
      <Loader2
        className="h-5 w-5 animate-spin text-brand-500 motion-reduce:animate-none"
        aria-hidden="true"
      />
      Loading your secure workspace…
    </div>
  );
}
