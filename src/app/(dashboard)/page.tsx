'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Globe2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { WebsiteCard } from '@/components/dashboard/WebsiteCard';
import { useAuthStore } from '@/store/auth.store';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { useBlogs } from '@/modules/blogs/hooks/useBlogs';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { Can } from '@/lib/permissions';
import { PERMISSIONS } from '@/constants/permissions';

const shortcutClassName =
  'admin-action inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 motion-safe:transition-colors motion-safe:duration-200 hover:border-brand-200 hover:bg-brand-25 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200 dark:hover:bg-brand-500/10 dark:hover:text-brand-400';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const roleKey = useAuthStore((state) => state.roleKey);
  const isEventStaff = roleKey === 'event_staff';
  const [search, setSearch] = React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (isEventStaff) router.replace('/attendance');
  }, [isEventStaff, router]);

  const {
    websites,
    meta,
    isLoading,
    error: websitesError,
  } = useWebsites({ limit: 100 }, { enabled: !isEventStaff });
  const {
    meta: blogsMeta,
    blogs: allBlogs,
    isLoading: blogsLoading,
    error: blogsError,
  } = useBlogs({ limit: 1000 }, { enabled: !isEventStaff });
  const {
    events: allEvents,
    isLoading: eventsLoading,
    error: eventsError,
  } = useEvents({}, { enabled: !isEventStaff });

  const blogCountsByWebsite = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allBlogs.forEach((blog) => {
      blog.websites?.forEach((website) => {
        const id = typeof website === 'string' ? website : website.id || website._id;
        if (typeof id === 'string' && id) counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  }, [allBlogs]);

  const eventCountsByWebsite = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allEvents.forEach((event) => {
      event.websites?.forEach((website: unknown) => {
        const id =
          typeof website === 'string'
            ? website
            : website && typeof website === 'object'
              ? (website as { id?: string; _id?: string }).id || (website as { _id?: string })._id
              : undefined;
        if (id) counts[id] = (counts[id] || 0) + 1;
      });
    });
    return counts;
  }, [allEvents]);

  const filteredWebsites = React.useMemo(
    () => websites.filter((site) => site.name.toLowerCase().includes(search.trim().toLowerCase())),
    [websites, search],
  );
  const blogCountsPartial = Boolean(blogsMeta && blogsMeta.total > allBlogs.length);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all(
        ['websites', 'blogs', 'events'].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        ),
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isEventStaff) {
    return (
      <div
        className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500"
        role="status"
      >
        <Loader2
          className="h-5 w-5 animate-spin text-brand-500 motion-reduce:animate-none"
          aria-hidden="true"
        />
        Opening attendance…
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <header className="dashboard-enter relative isolate flex flex-col justify-between gap-5 overflow-hidden rounded-xl border border-navy-700 border-t-2 border-t-brand-500 bg-navy-900 p-5 sm:p-6 lg:flex-row lg:items-end">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-64 overflow-hidden sm:block"
        >
          <span className="absolute -right-10 -top-16 size-64 rounded-full border border-white/10" />
          <span className="absolute -right-2 -top-8 size-48 rounded-full border border-white/10" />
          <span className="absolute right-14 top-8 size-16 rounded-full border-8 border-brand-500/25" />
          <span className="absolute right-8 top-16 h-px w-28 bg-white/15" />
          <span className="absolute right-[5.5rem] top-2 h-28 w-px bg-white/15" />
        </div>
        <div className="admin-section-heading relative min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-navy-200">
            Core Media / Publishing desk
          </p>
          <h1 className="max-w-xl font-roboto text-2xl font-semibold leading-tight text-white sm:text-3xl">
            Your publishing workspace
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-200">
            A clear view of your properties, content, and events.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isRefreshing}
          className="admin-action relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-white/20 bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white hover:border-white/40 hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 disabled:cursor-wait disabled:opacity-60 motion-safe:transition-colors motion-safe:duration-200 lg:self-auto"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}
            aria-hidden="true"
          />
          {isRefreshing ? 'Refreshing…' : 'Refresh data'}
        </button>
      </header>

      <section
        aria-label="Workspace summary"
        className="dashboard-card-list grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5"
      >
        <SummaryCard
          title="Managed properties"
          value={websitesError ? '—' : (meta?.total ?? websites.length)}
          icon={<Globe2 size={18} />}
          iconBgColor="bg-navy-50 dark:bg-navy-700"
          iconTextColor="text-navy-600 dark:text-navy-200"
          isLoading={isLoading}
          description={websitesError ? 'Property data unavailable' : 'Websites in your workspace'}
        />
        <SummaryCard
          title="Blog library"
          value={blogsError ? '—' : (blogsMeta?.total ?? allBlogs.length)}
          icon={<FileText size={18} />}
          iconBgColor="bg-navy-50 dark:bg-navy-700"
          iconTextColor="text-navy-600 dark:text-navy-200"
          isLoading={blogsLoading}
          description={blogsError ? 'Blog data unavailable' : 'Published and draft content'}
        />
        <SummaryCard
          title="Events"
          value={eventsError ? '—' : allEvents.length}
          icon={<CalendarDays size={18} />}
          iconBgColor="bg-brand-25 dark:bg-brand-500/10"
          iconTextColor="text-brand-600 dark:text-brand-400"
          isLoading={eventsLoading}
          description={eventsError ? 'Event data unavailable' : 'Events returned by your library'}
        />
      </section>

      {(websitesError || blogsError || eventsError) && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-300 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>Some dashboard data could not be loaded. Unavailable counts are shown as —.</p>
          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing}
            className="admin-action min-h-11 shrink-0 rounded-lg px-3 font-semibold hover:bg-warning-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-safe:transition-colors dark:hover:bg-warning-500/20"
          >
            Try again
          </button>
        </div>
      )}

      <nav
        aria-label="Workspace shortcuts"
        className="dashboard-enter dashboard-delay-2 flex flex-wrap gap-2"
      >
        <Can permission={PERMISSIONS.BLOGS_VIEW}>
          <Link href="/blogs" className={shortcutClassName}>
            <FileText size={16} aria-hidden="true" />
            Blog library
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </Can>
        <Can permission={PERMISSIONS.EVENTS_VIEW}>
          <Link href="/events" className={shortcutClassName}>
            <CalendarDays size={16} aria-hidden="true" />
            Events
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </Can>
        <Can permission={PERMISSIONS.WEBSITES_CREATE}>
          <Link href="/websites/create" className={shortcutClassName}>
            <Plus size={16} aria-hidden="true" />
            Add property
          </Link>
        </Can>
      </nav>

      <section aria-labelledby="properties-heading">
        <div className="dashboard-enter dashboard-delay-3 mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="admin-section-heading">
            <h2
              id="properties-heading"
              className="font-roboto text-xl font-semibold text-gray-900 dark:text-white"
            >
              Managed properties
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isLoading
                ? 'Loading your properties…'
                : websitesError
                  ? 'Property data is temporarily unavailable.'
                  : `${filteredWebsites.length} of ${websites.length} loaded properties${meta && meta.total > websites.length ? ` (${meta.total} total)` : ''}`}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <label className="sr-only" htmlFor="property-search">
              Search loaded properties
            </label>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="property-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search properties"
              className="min-h-11 w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-navy-700 dark:bg-navy-800 dark:text-white sm:text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-label="Loading properties"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="admin-surface h-64 animate-pulse rounded-xl border border-gray-100 bg-white p-6 motion-reduce:animate-none dark:border-navy-700 dark:bg-navy-800"
              >
                <div className="h-16 w-24 rounded-lg bg-gray-100 dark:bg-navy-700" />
                <div className="mt-5 h-5 w-3/4 rounded bg-gray-100 dark:bg-navy-700" />
                <div className="mt-5 h-16 rounded bg-gray-50 dark:bg-navy-700" />
              </div>
            ))}
          </div>
        ) : websitesError ? (
          <div className="admin-surface rounded-xl border border-gray-100 bg-white p-8 text-center dark:border-navy-700 dark:bg-navy-800">
            <Globe2 className="mx-auto mb-3 h-8 w-8 text-gray-400" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Properties could not be loaded
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try refreshing the data to reconnect to your workspace.
            </p>
          </div>
        ) : filteredWebsites.length === 0 ? (
          <div className="admin-surface rounded-xl border border-dashed border-gray-200 bg-white px-5 py-12 text-center dark:border-navy-700 dark:bg-navy-800">
            <Globe2 className="mx-auto mb-4 h-8 w-8 text-gray-400" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {search.trim() ? 'No matching properties' : 'No properties yet'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {search.trim()
                ? 'Try a different property name or clear your search.'
                : 'Properties will appear here once they are added to your workspace.'}
            </p>
            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="admin-action mt-4 min-h-11 rounded-lg px-4 text-sm font-semibold text-brand-600 hover:bg-brand-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-safe:transition-colors dark:text-brand-400 dark:hover:bg-brand-500/10"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="dashboard-card-list grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredWebsites.map((site) => (
              <WebsiteCard
                key={site.id}
                className="dashboard-property-card"
                id={site.id}
                logo={site.logo}
                title={site.name}
                status={site.isActive ? 'ACTIVE' : 'INACTIVE'}
                blogsCount={blogsError ? null : (blogCountsByWebsite[site.id] ?? 0)}
                eventsCount={eventsError ? null : (eventCountsByWebsite[site.id] ?? 0)}
                blogsLoading={blogsLoading}
                eventsLoading={eventsLoading}
                countsPartial={blogCountsPartial}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
