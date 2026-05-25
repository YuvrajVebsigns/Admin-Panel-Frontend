'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Plus,
  Search,
  Loader2,
  ExternalLink,
  ChevronRight,
  Layout,
  Compass,
  Globe,
} from 'lucide-react';
import { useWebsite } from '@/modules/websites/hooks/useWebsites';
import { useBlogs } from '@/modules/blogs/hooks/useBlogs';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Image from 'next/image';
import { BlogTable } from '@/modules/blogs/components/BlogTable';
import { EventTable } from '@/modules/events/components/EventTable';
import { PageManager } from '@/modules/websites/components/PageManager';
import { NavbarManager } from '@/modules/websites/components/NavbarManager';
import { WebsiteSeoManager } from '@/modules/websites/components/WebsiteSeoManager';
import { useWebsitePages } from '@/modules/websites/hooks/useWebsitePages';
import { getImageUrl } from '@/lib/utils';

const TABS = [
  { id: 'blogs', label: 'Blogs', icon: <FileText size={18} /> },
  { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
  { id: 'pages', label: 'Pages', icon: <Layout size={18} /> },
  { id: 'navbar', label: 'Navigation', icon: <Compass size={18} /> },
  { id: 'seo', label: 'Website SEO', icon: <Globe size={18} /> },
];

export default function WebsiteDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;
  const { website, isLoading } = useWebsite(websiteId);
  const { meta: blogsMeta } = useBlogs({ limit: 1000, websiteId });
  const { events: websiteEvents, isLoading: isEventsLoading } = useEvents({ websiteId });
  const { pages: websitePages, isLoading: isPagesLoading } = useWebsitePages({
    siteId: websiteId,
    limit: 1000,
  });
  const [activeTab, setActiveTab] = useState('blogs');

  if (isLoading || isEventsLoading || isPagesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Loading property insights...
        </p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Property Not Found</h2>
        <p className="text-gray-500 max-w-xs">
          The website property you are looking for might have been removed or the ID is incorrect.
        </p>
        <Button variant="primary" onClick={() => router.push('/websites')}>
          Back to Websites
        </Button>
      </div>
    );
  }

  const stats = [
    {
      title: 'TOTAL PAGES',
      value: websitePages?.length || 0,
      icon: <Layout size={24} strokeWidth={1.5} />,
      bgIllustration: <Layout size={100} strokeWidth={1} />,
      iconBgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      iconTextColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'TOTAL BLOGS',
      value: blogsMeta?.total || 0,
      icon: <FileText size={24} strokeWidth={1.5} />,
      bgIllustration: <FileText size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'TOTAL EVENTS',
      value: websiteEvents?.length || 0,
      icon: <Calendar size={24} strokeWidth={1.5} />,
      bgIllustration: <Calendar size={100} strokeWidth={1} />,
      iconBgColor: 'bg-purple-50 dark:bg-purple-500/10',
      iconTextColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-brand-500 hover:text-brand-500 transition-all dark:bg-navy-800 dark:border-navy-700 dark:hover:border-brand-500"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-navy-800 dark:border-navy-700 flex items-center justify-center">
              {getImageUrl(website.logo) ? (
                <Image
                  src={getImageUrl(website.logo)}
                  alt={website.name}
                  fill
                  sizes="56px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-xl font-bold text-brand-600 uppercase">
                  {website.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {website.name}
                </h1>
                <Badge color={website.isActive ? 'success' : 'light'}>
                  {website.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                Dashboard <ChevronRight size={14} className="text-gray-300" /> Website insights
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => window.open(website.domain, '_blank')}
            className="bg-white dark:bg-navy-800 border-gray-100 dark:border-navy-700 hover:border-brand-500"
          >
            <ExternalLink size={18} className="mr-2" />
            Visit Website
          </Button>
          <Button variant="primary" onClick={() => router.push(`/websites/update/${website.id}`)}>
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <SummaryCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgIllustration={stat.bgIllustration}
            iconBgColor={stat.iconBgColor}
            iconTextColor={stat.iconTextColor}
          />
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-theme-sm dark:bg-navy-800 dark:border-navy-700">
        {/* Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 dark:border-navy-700 p-6 gap-4">
          <div className="flex items-center p-1 bg-gray-50 dark:bg-navy-900 rounded-xl w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-brand-600 shadow-sm dark:bg-navy-800 dark:text-white'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === 'blogs' || activeTab === 'events') && (
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all dark:bg-navy-900 dark:text-white w-full sm:w-64"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  if (activeTab === 'blogs') {
                    router.push(
                      `/blogs/create?websiteId=${websiteId}&from=/websites/dashboard/${websiteId}`,
                    );
                  } else if (activeTab === 'events') {
                    router.push(
                      `/events/new?websiteId=${websiteId}&from=/websites/dashboard/${websiteId}`,
                    );
                  }
                }}
              >
                <Plus size={18} className="mr-2" />
                New {activeTab === 'blogs' ? 'Blog' : 'Event'}
              </Button>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {activeTab === 'navbar'
                  ? 'Navigation Menu links'
                  : activeTab === 'seo'
                    ? 'Global Website SEO'
                    : activeTab}{' '}
                <span className="ml-2 text-sm font-medium text-gray-400">
                  {activeTab === 'pages'
                    ? websitePages?.length || 0
                    : activeTab === 'blogs'
                      ? blogsMeta?.total || 0
                      : activeTab === 'events'
                        ? websiteEvents?.length || 0
                        : ''}{' '}
                  {activeTab !== 'seo' && activeTab !== 'navbar' && 'Total'}
                </span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage and monitor your website's {activeTab} content
              </p>
            </div>
          </div>

          {activeTab === 'pages' ? (
            <PageManager siteId={websiteId} />
          ) : activeTab === 'navbar' ? (
            <NavbarManager siteId={websiteId} />
          ) : activeTab === 'seo' ? (
            <WebsiteSeoManager siteId={websiteId} />
          ) : activeTab === 'blogs' ? (
            <BlogTable websiteId={websiteId} />
          ) : (
            <EventTable websiteId={websiteId} />
          )}
        </div>
      </div>
    </div>
  );
}
