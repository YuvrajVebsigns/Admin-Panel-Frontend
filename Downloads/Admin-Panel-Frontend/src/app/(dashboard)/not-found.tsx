'use client';

// import React from 'react';
import Link from 'next/link';
import React, { useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';


interface Website {
  id: number;
  name: string;
  domain: string;
  status: 'Active' | 'Inactive';
  blogs: number;
  events: number;
  lastUpdated: string;
}

export default function WebsitesPage() {
  const [websites] = useState<Website[]>([
    {
      id: 1,
      name: 'CORE Media Group',
      domain: 'coremediagroup.com',
      status: 'Active',
      blogs: 5,
      events: 4,
      lastUpdated: 'Today',
    },
    {
      id: 2,
      name: 'CIO Powerlist',
      domain: 'ciopowerlist.com',
      status: 'Active',
      blogs: 3,
      events: 3,
      lastUpdated: 'Yesterday',
    },
    {
      id: 3,
      name: 'CIO Dialogues',
      domain: 'ciodialogues.com',
      status: 'Active',
      blogs: 4,
      events: 2,
      lastUpdated: '2 days ago',
    },
    {
      id: 4,
      name: 'LeaderNext',
      domain: 'leader-next.com',
      status: 'Active',
      blogs: 3,
      events: 2,
      lastUpdated: '4 days ago',
    },
    {
      id: 5,
      name: 'CIO Choice',
      domain: 'ciochoice.com',
      status: 'Active',
      blogs: 4,
      events: 2,
      lastUpdated: '1 week ago',
    },
    {
      id: 6,
      name: 'CIO Crown',
      domain: 'ciocrown.com',
      status: 'Active',
      blogs: 2,
      events: 2,
      lastUpdated: '2 weeks ago',
    },
    {
      id: 7,
      name: 'CXO Capital',
      domain: 'cxocapital.com',
      status: 'Active',
      blogs: 3,
      events: 2,
      lastUpdated: '3 weeks ago',
    },
    {
      id: 8,
      name: 'MEA CIO Powerlist',
      domain: 'meacio.com',
      status: 'Active',
      blogs: 2,
      events: 2,
      lastUpdated: 'Today',
    },
    {
      id: 9,
      name: 'MEA CIO Choice',
      domain: 'meachoice.com',
      status: 'Active',
      blogs: 2,
      events: 2,
      lastUpdated: 'Yesterday',
    },
    {
      id: 10,
      name: 'DCCAI 2026',
      domain: 'dccai2026.com',
      status: 'Active',
      blogs: 2,
      events: 2,
      lastUpdated: '5 days ago',
    },
    {
      id: 11,
      name: 'CIO Angel Network',
      domain: 'cioangel.com',
      status: 'Active',
      blogs: 2,
      events: 2,
      lastUpdated: '1 week ago',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredWebsites = websites.filter((website) => {
    const matchesSearch =
      website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.domain.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Websites
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Manage and monitor all 11 platforms under CORE Media Group.
          </p>
        </div>
        {/* <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-all">
          <span>+</span>
          Add New Website
        </button> */}
      </div>

      {/* Main Content Card */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        {/* Search and Filter Section */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <input
              type="text"
              placeholder="Search platforms by name or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {/* <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center gap-2">
            ⬇️ Export List
          </button> */}
        </div>

        {/* Websites Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  PLATFORM
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  CONTENT METRICS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWebsites.map((website) => (
                <tr
                  key={website.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Platform Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {website.name}
                        </p>
                        <a
                          href={`https://${website.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {website.domain} ↗
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></span>
                      {website.status}
                    </span>
                  </td>

                  {/* Content Metrics Column */}
                  <td className="px-4 py-4">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                          Blogs
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {website.blogs}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                          Events
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {website.events}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Last Updated Column */}
                  {/* Removed */}

                  {/* Actions Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/websites/${encodeURIComponent(website.name)}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        Dashboard →
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results Message */}
        {filteredWebsites.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No websites found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


