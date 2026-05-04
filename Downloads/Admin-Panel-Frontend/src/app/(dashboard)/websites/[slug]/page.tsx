import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Dashboard | Core Media Admin',
  description: 'Website-specific dashboard and management',
};

type WebsiteData = {
  name: string;
  websiteNumber: number;
  blogs: number;
  events: number;
  registrations: number;
  blogList: Array<{
    title: string;
    author: string;
    date: string;
    status: 'Published' | 'Draft';
  }>;
};

// Mock data for different websites
const websiteData: Record<string, WebsiteData> = {
  'CORE Media Group': {
    name: 'CORE Media Group',
    websiteNumber: 1,
    blogs: 5,
    events: 5,
    registrations: 600,
    blogList: [
      { title: 'The Future of AI in Business', author: 'Arun Kumar', date: 'Jan 15, 2024', status: 'Published' },
      { title: 'Cloud Strategy Guide', author: 'Vikram Singh', date: 'Jan 13, 2024', status: 'Published' },
      { title: 'Security Trends 2024', author: 'Priya Sharma', date: 'Jan 12, 2024', status: 'Draft' },
      { title: 'Digital Transformation Guide', author: 'Rajesh Patel', date: 'Jan 10, 2024', status: 'Published' },
      { title: 'IoT Solutions Overview', author: 'Neha Gupta', date: 'Jan 8, 2024', status: 'Published' },
    ],
  },
  'CIO Powerlist': {
    name: 'CIO Powerlist',
    websiteNumber: 2,
    blogs: 4,
    events: 3,
    registrations: 450,
    blogList: [
      { title: 'Leadership Excellence', author: 'John Smith', date: 'Jan 20, 2024', status: 'Published' },
      { title: 'CIO Best Practices', author: 'Sarah Johnson', date: 'Jan 18, 2024', status: 'Published' },
      { title: 'Technology Trends', author: 'Mike Chen', date: 'Jan 15, 2024', status: 'Draft' },
      { title: 'Digital Innovation', author: 'Emma Wilson', date: 'Jan 12, 2024', status: 'Published' },
    ],
  },
  'CIO Dialogues': {
    name: 'CIO Dialogues',
    websiteNumber: 3,
    blogs: 3,
    events: 2,
    registrations: 320,
    blogList: [
      { title: 'Event Recap: Tech Summit 2024', author: 'Alex Turner', date: 'Jan 22, 2024', status: 'Published' },
      { title: 'Interview with Industry Leaders', author: 'Lisa Anderson', date: 'Jan 19, 2024', status: 'Published' },
      { title: 'Upcoming Events Schedule', author: 'Tom Brown', date: 'Jan 15, 2024', status: 'Draft' },
    ],
  },
  'Leader Next': {
    name: 'Leader Next',
    websiteNumber: 4,
    blogs: 3,
    events: 3,
    registrations: 280,
    blogList: [
      { title: 'Building Tomorrow\'s Leaders', author: 'David Lee', date: 'Jan 21, 2024', status: 'Published' },
      { title: 'Leadership Development Program', author: 'Grace Kim', date: 'Jan 17, 2024', status: 'Published' },
      { title: 'Mentorship Success Stories', author: 'Robert Zhang', date: 'Jan 14, 2024', status: 'Draft' },
    ],
  },
  'CIO Crown': {
    name: 'CIO Crown',
    websiteNumber: 5,
    blogs: 2,
    events: 2,
    registrations: 220,
    blogList: [
      { title: 'Crown Achievements 2024', author: 'James Wilson', date: 'Jan 19, 2024', status: 'Published' },
      { title: 'CIO Excellence Program', author: 'Nicole Davis', date: 'Jan 16, 2024', status: 'Published' },
    ],
  },
  'CIO Choice': {
    name: 'CIO Choice',
    websiteNumber: 6,
    blogs: 3,
    events: 2,
    registrations: 350,
    blogList: [
      { title: 'Award Winners 2024', author: 'Monica Patel', date: 'Jan 25, 2024', status: 'Published' },
      { title: 'Excellence in Innovation', author: 'Kevin Brown', date: 'Jan 23, 2024', status: 'Published' },
      { title: 'Technology Leadership Awards', author: 'Amanda White', date: 'Jan 20, 2024', status: 'Draft' },
    ],
  },
  'CXO Capital': {
    name: 'CXO Capital',
    websiteNumber: 7,
    blogs: 2,
    events: 2,
    registrations: 280,
    blogList: [
      { title: 'Investment Opportunities', author: 'Peter Johnson', date: 'Jan 24, 2024', status: 'Published' },
      { title: 'CXO Collaboration Framework', author: 'Sandra Lee', date: 'Jan 21, 2024', status: 'Draft' },
    ],
  },
  'CXO Capital MEA': {
    name: 'CXO Capital MEA',
    websiteNumber: 8,
    blogs: 15,
    events: 1,
    registrations: 180,
    blogList: [
      { title: 'MEA Leadership Summit', author: 'Hassan Al-Rashid', date: 'Jan 23, 2024', status: 'Published' },
    ],
  },
  'MEA CIO Choice': {
    name: 'MEA CIO Choice',
    websiteNumber: 9,
    blogs: 3,
    events: 2,
    registrations: 200,
    blogList: [
      { title: 'Middle East Tech Innovation', author: 'Fatima Ahmed', date: 'Jan 22, 2024', status: 'Published' },
      { title: 'Regional Awards Program', author: 'Mohammed Hassan', date: 'Jan 20, 2024', status: 'Published' },
      { title: 'CIO Excellence in MEA', author: 'Leila Mansouri', date: 'Jan 18, 2024', status: 'Draft' },
    ],
  },
  'DCCAI 2026': {
    name: 'DCCAI 2026',
    websiteNumber: 10,
    blogs: 2,
    events: 2,
    registrations: 520,
    blogList: [
      { title: 'DCCAI 2026 Schedule', author: 'Ravi Sharma', date: 'Jan 20, 2024', status: 'Published' },
      { title: 'Summit Highlights & Agenda', author: 'Pooja Verma', date: 'Jan 18, 2024', status: 'Draft' },
    ],
  },
  'CIO Angel Network': {
    name: 'CIO Angel Network',
    websiteNumber: 11,
    blogs: 2,
    events: 1,
    registrations: 150,
    blogList: [
      { title: 'Angel Investment Opportunities', author: 'Vikram Malhotra', date: 'Jan 21, 2024', status: 'Published' },
    ],
  },
  'B2B 1K': {
    name: 'B2B 1K',
    websiteNumber: 12,
    blogs: 2,
    events: 2,
    registrations: 380,
    blogList: [
      { title: 'B2B Collaboration Network', author: 'Ankit Verma', date: 'Jan 25, 2024', status: 'Published' },
      { title: 'Partnership Opportunities', author: 'Deepak Sharma', date: 'Jan 22, 2024', status: 'Draft' },
    ],
  },
};

export default function WebsiteDashboard({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const website = websiteData[decodedSlug] || {
    name: decodedSlug,
    websiteNumber: 0,
    blogs: 0,
    events: 0,
    registrations: 0,
    blogList: [],
  };
  const websiteName = website.name || decodedSlug;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{websiteName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard • Website • {websiteName}</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Blogs */}
        <div className="rounded-xl border border-l-4 border-l-blue-500 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">TOTAL BLOGS</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{website.blogs}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Published content</p>
        </div>

        {/* Total Events */}
        <div className="rounded-xl border border-l-4 border-l-purple-500 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">TOTAL EVENTS</p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{website.events}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled events</p>
        </div>

        {/* Total Registrations */}
        <div className="rounded-xl border border-l-4 border-l-green-500 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">TOTAL REGISTRATIONS</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{website.registrations}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Event registrations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-8">
          <button className="pb-3 px-1 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-medium">
            Blogs
          </button>
          <button className="pb-3 px-1 border-b-2 border-transparent text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-300">
            Events
          </button>
        </div>
      </div>

      {/* Blogs List */}
      <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blogs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and monitor blog content</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            + New Blog
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Blog Title & Author</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {website.blogList.map((blog, index: number) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{blog.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">by {blog.author}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{blog.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      blog.status === 'Published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
