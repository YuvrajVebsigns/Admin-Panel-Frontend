'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Globe2 } from 'lucide-react';
import Image from 'next/image';
import { ImageLinks } from '@/modules/websites/types/website.types';
import { getImageUrl } from '@/lib/utils';
import { Can } from '@/lib/permissions';
import { PERMISSIONS } from '@/constants/permissions';

export interface WebsiteCardProps {
  id: string;
  logo?: string | ImageLinks;
  title: string;
  status: 'ACTIVE' | 'INACTIVE';
  blogsCount: number | null;
  eventsCount: number | null;
  blogsLoading?: boolean;
  eventsLoading?: boolean;
  countsPartial?: boolean;
  className?: string;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({
  id,
  logo,
  title,
  status,
  blogsCount,
  eventsCount,
  blogsLoading,
  eventsLoading,
  countsPartial,
  className = '',
}) => {
  const resolvedLogoUrl = getImageUrl(logo);
  const [failedLogo, setFailedLogo] = useState<string | null>(null);

  return (
    <article
      className={`admin-surface flex min-w-0 flex-col rounded-xl border border-gray-100 bg-white p-5 focus-within:border-brand-300 dark:border-navy-700 dark:bg-navy-800 dark:focus-within:border-brand-400 sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white">
          {resolvedLogoUrl && failedLogo !== resolvedLogoUrl ? (
            <Image
              src={resolvedLogoUrl}
              alt={`${title} logo`}
              fill
              sizes="96px"
              className="object-contain p-2"
              onError={() => setFailedLogo(resolvedLogoUrl)}
            />
          ) : (
            <Globe2 size={26} className="text-navy-400" aria-hidden="true" />
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status === 'ACTIVE' ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400' : 'bg-gray-50 text-gray-500 dark:bg-navy-700 dark:text-gray-300'}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-success-500' : 'bg-gray-400'}`}
            aria-hidden="true"
          />
          {status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </span>
      </div>
      <h3 className="mt-5 break-words font-roboto text-lg font-semibold leading-snug text-gray-900 dark:text-white">
        {title}
      </h3>
      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-navy-700">
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Blogs</dt>
          <dd className="mt-1 font-roboto text-xl font-semibold tabular-nums text-gray-900 dark:text-white">
            {blogsLoading ? (
              <span
                className="block h-6 w-10 animate-pulse rounded bg-gray-100 motion-reduce:animate-none dark:bg-navy-700"
                aria-label="Loading blogs"
              />
            ) : blogsCount === null ? (
              <span title="Blog data unavailable">—</span>
            ) : (
              blogsCount.toLocaleString()
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500 dark:text-gray-400">Events</dt>
          <dd className="mt-1 font-roboto text-xl font-semibold tabular-nums text-gray-900 dark:text-white">
            {eventsLoading ? (
              <span
                className="block h-6 w-10 animate-pulse rounded bg-gray-100 motion-reduce:animate-none dark:bg-navy-700"
                aria-label="Loading events"
              />
            ) : eventsCount === null ? (
              <span title="Event data unavailable">—</span>
            ) : (
              eventsCount.toLocaleString()
            )}
          </dd>
        </div>
      </dl>
      {countsPartial && (
        <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Blog counts reflect the loaded records.
        </p>
      )}
      <Can permission={PERMISSIONS.WEBSITES_VIEW}>
        <Link
          href={`/websites/dashboard/${id}`}
          aria-label={`Open ${title} dashboard`}
          className="admin-action group mt-5 flex min-h-11 items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-brand-200 hover:bg-brand-25 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-safe:transition-colors motion-safe:duration-200 dark:border-navy-700 dark:text-gray-200 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
        >
          Open property
          <ArrowUpRight
            size={17}
            className="motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </Can>
    </article>
  );
};
