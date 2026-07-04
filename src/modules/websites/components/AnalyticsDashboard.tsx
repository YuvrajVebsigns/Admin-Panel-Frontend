'use client';
import React, { useState } from 'react';
import {
  Eye,
  Users,
  MousePointer,
  ShieldCheck,
  Globe,
  Info,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import Badge from '@/components/ui/badge/Badge';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

interface AnalyticsDashboardProps {
  siteId: string;
}

const RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 },
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ siteId }) => {
  const [days, setDays] = useState(30);

  // Calculate startDate based on chosen range
  const getQueryParams = () => {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return {
      startDate: start.toISOString(),
      endDate: new Date().toISOString(),
    };
  };

  const { summary, isLoading, error } = useAnalytics(siteId, getQueryParams());

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm font-semibold text-gray-400">Loading website analytics...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-center p-6">
        <p className="text-red-500 font-medium">Failed to load analytics data.</p>
        <p className="text-xs text-gray-400 max-w-sm">
          Please make sure the backend is running and the database connection is healthy.
        </p>
      </div>
    );
  }

  const { metrics, topPages, topReferrers, dailyTrend, recentActivity } = summary;

  // Chart setup
  const chartOptions: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Outfit, Inter, sans-serif',
      fontSize: '13px',
      fontWeight: 500,
    },
    colors: ['#4F46E5', '#10B981'], // Indigo & Emerald
    chart: {
      fontFamily: 'Outfit, Inter, sans-serif',
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    markers: {
      size: 4,
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'category',
      categories: dailyTrend.map((t) => {
        const date = new Date(t.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          colors: ['#64748b'],
        },
      },
    },
  };

  const chartSeries = [
    {
      name: 'Page Views',
      data: dailyTrend.map((t) => t.pageViews),
    },
    {
      name: 'Unique Visitors',
      data: dailyTrend.map((t) => t.uniqueVisitors),
    },
  ];

  // Helper to format timestamps relative or clean IST format
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Get color for event badges
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'consent_accepted':
        return 'success';
      case 'consent_declined':
        return 'error';
      case 'pageview':
        return 'info';
      default:
        return 'warning';
    }
  };

  return (
    <div className="space-y-8">
      {/* Filters and Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-navy-900/50 p-4 rounded-2xl border border-gray-100 dark:border-navy-700">
        <div className="flex items-center gap-2.5">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Analytics Timeframe
          </span>
        </div>
        <div className="flex items-center p-1 bg-gray-100 dark:bg-navy-950 rounded-xl w-fit">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                days === opt.value
                  ? 'bg-white text-brand-600 shadow-sm dark:bg-navy-800 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Unique Visitors"
          value={metrics.uniqueVisitors}
          icon={<Users size={24} strokeWidth={1.5} />}
          iconBgColor="bg-blue-50 dark:bg-blue-500/10"
          iconTextColor="text-blue-600 dark:text-blue-400"
        />
        <SummaryCard
          title="Page Views"
          value={metrics.pageViews}
          icon={<Eye size={24} strokeWidth={1.5} />}
          iconBgColor="bg-indigo-50 dark:bg-indigo-500/10"
          iconTextColor="text-indigo-600 dark:text-indigo-400"
        />
        <SummaryCard
          title="Total Sessions"
          value={metrics.sessions}
          icon={<MousePointer size={24} strokeWidth={1.5} />}
          iconBgColor="bg-purple-50 dark:bg-purple-500/10"
          iconTextColor="text-purple-600 dark:text-purple-400"
        />
        <SummaryCard
          title="Consent Acceptance"
          value={`${metrics.consentRate}%`}
          icon={<ShieldCheck size={24} strokeWidth={1.5} />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-500/10"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Graphs section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Traffic Trend Graph */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Traffic Trend</h3>
          <div className="h-80 w-full">
            {dailyTrend.length > 0 ? (
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height="100%"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
                <Info className="text-gray-400 w-10 h-10" />
                <p className="text-sm font-semibold text-gray-500">No trend data logged yet</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Visitor events will generate traffic points here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cookie Consent Analytics */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Consent Tracker
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              User responses to cookie tracking consent prompt
            </p>

            <div className="space-y-5">
              {/* Accepted Bar */}
              <div>
                <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Accepted
                  </span>
                  <span>{metrics.consentAccepts}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-navy-950 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        metrics.consentAccepts + metrics.consentDeclines > 0
                          ? Math.round(
                              (metrics.consentAccepts /
                                (metrics.consentAccepts + metrics.consentDeclines)) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Declined Bar */}
              <div>
                <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    Declined
                  </span>
                  <span>{metrics.consentDeclines}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-navy-950 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        metrics.consentAccepts + metrics.consentDeclines > 0
                          ? Math.round(
                              (metrics.consentDeclines /
                                (metrics.consentAccepts + metrics.consentDeclines)) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 dark:border-navy-700 text-center">
            <div className="inline-flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-navy-950 rounded-2xl w-full">
              <span className="text-2xl font-black text-brand-600 dark:text-white">
                {metrics.consentRate}%
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                Conversion Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pages and Referrer Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Visited Pages */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Pages</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 dark:border-navy-700 pb-3">
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">
                    Rank
                  </th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Page URL
                  </th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-24">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-navy-800">
                {topPages.length > 0 ? (
                  topPages.map((page, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-navy-800/30">
                      <td className="py-3.5 text-sm font-semibold text-gray-500">{idx + 1}</td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white max-w-sm truncate">
                          {page.pageTitle || 'No Title'}
                        </div>
                        <div className="text-xs text-gray-400 max-w-sm truncate font-mono mt-0.5">
                          {page.pageUrl}
                        </div>
                      </td>
                      <td className="py-3.5 text-sm font-bold text-gray-900 dark:text-white text-right">
                        {page.count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-gray-400">
                      No pageviews tracked yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Referrers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 dark:border-navy-700 pb-3">
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">
                    Rank
                  </th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right w-24">
                    Sessions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-navy-800">
                {topReferrers.length > 0 ? (
                  topReferrers.map((ref, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-navy-800/30">
                      <td className="py-3.5 text-sm font-semibold text-gray-500">{idx + 1}</td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-gray-400 shrink-0" />
                          <span className="font-semibold text-sm text-gray-900 dark:text-white font-mono max-w-sm truncate">
                            {ref.referrer}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-sm font-bold text-gray-900 dark:text-white text-right">
                        {ref.count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-gray-400">
                      No referrers logged yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Event Stream */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Activity Stream
            </h3>
            <p className="text-xs text-gray-400">
              Real-time log of visitor actions (Last 50 events)
            </p>
          </div>
          <Badge color="light">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
              Live Feed
            </span>
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 dark:border-navy-700 pb-3">
                <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-40">
                  Time (IST)
                </th>
                <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-36">
                  Visitor ID
                </th>
                <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-32">
                  Event
                </th>
                <th className="pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Location / Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-navy-800">
              {recentActivity.length > 0 ? (
                recentActivity.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-navy-800/30 text-sm"
                  >
                    <td className="py-3.5 text-gray-500 font-mono text-xs whitespace-nowrap">
                      {formatTime(event.createdAt)}
                    </td>
                    <td className="py-3.5">
                      <span className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-navy-950 px-2 py-1 rounded-lg border border-gray-100 dark:border-navy-800">
                        {event.visitorId.slice(0, 14)}...
                      </span>
                    </td>
                    <td className="py-3.5">
                      <Badge color={getBadgeColor(event.eventType)}>
                        <span className="capitalize">{event.eventType.replace('_', ' ')}</span>
                      </Badge>
                    </td>
                    <td className="py-3.5">
                      {event.eventType === 'pageview' ? (
                        <div className="flex items-center gap-1 max-w-md truncate font-mono text-xs">
                          <span className="text-gray-400">URL:</span>
                          <span className="text-gray-900 dark:text-white font-semibold truncate">
                            {event.pageUrl}
                          </span>
                        </div>
                      ) : event.eventType === 'interaction' ? (
                        <div className="text-xs text-gray-500 font-semibold truncate max-w-md">
                          Click:{' '}
                          {String(
                            event.metadata?.elementId ||
                              event.metadata?.elementText ||
                              'interaction',
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          {event.userAgent ? event.userAgent.slice(0, 50) + '...' : 'System'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                    Waiting for events...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
