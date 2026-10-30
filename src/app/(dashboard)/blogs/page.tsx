'use client';
import React, { useState } from 'react';
import { BlogTable } from '@/modules/blogs/components/BlogTable';
import Button from '@/components/ui/button/Button';
import { Plus, FileText, CheckCircle, FileEdit } from 'lucide-react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useRouter } from 'next/navigation';
import { useBlogs } from '@/modules/blogs/hooks/useBlogs';

import { useHasPermission } from '@/lib/permissions';
import { PERMISSIONS } from '@/constants/permissions';

export default function BlogsPage() {
  const router = useRouter();
  const canViewBlogs = useHasPermission(PERMISSIONS.BLOGS_VIEW);
  const canCreateBlog = useHasPermission(PERMISSIONS.BLOGS_CREATE);

  const { meta: allBlogs } = useBlogs({ limit: 1 }, { enabled: canViewBlogs });
  const { meta: activeBlogs } = useBlogs({ limit: 1, isActive: true }, { enabled: canViewBlogs });
  const { meta: draftedBlogs } = useBlogs({ limit: 1, isActive: false }, { enabled: canViewBlogs });

  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  if (!canViewBlogs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          You do not have permission to view blogs. Please contact your system administrator.
        </p>
      </div>
    );
  }

  const stats = [
    {
      id: 'ALL',
      title: 'Total Blogs',
      value: allBlogs?.total || 0,
      icon: <FileText size={24} strokeWidth={1.5} />,
      bgIllustration: <FileText size={100} strokeWidth={1} />,
      iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
      iconTextColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'PUBLISHED',
      title: 'Active Blogs',
      value: activeBlogs?.total || 0,
      icon: <CheckCircle size={24} strokeWidth={1.5} />,
      bgIllustration: <CheckCircle size={100} strokeWidth={1} />,
      iconBgColor: 'bg-green-50 dark:bg-green-500/10',
      iconTextColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'DRAFT',
      title: 'Drafted Blogs',
      value: draftedBlogs?.total || 0,
      icon: <FileEdit size={24} strokeWidth={1.5} />,
      bgIllustration: <FileEdit size={100} strokeWidth={1} />,
      iconBgColor: 'bg-orange-50 dark:bg-orange-500/10',
      iconTextColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blogs</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Manage and review all {allBlogs?.total || 0} blogs across all CORE Media platforms.
          </p>
        </div>
        {canCreateBlog && (
          <Button
            variant="primary"
            className="shadow-lg shadow-brand-500/20 px-6"
            onClick={() => router.push('/blogs/create')}
          >
            <Plus size={18} className="mr-2" />
            Add New Blog
          </Button>
        )}
      </div>

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
            onClick={() => setFilter(stat.id as 'ALL' | 'PUBLISHED' | 'DRAFT')}
            isActive={filter === stat.id}
          />
        ))}
      </div>

      <BlogTable isActiveFilter={filter === 'ALL' ? undefined : filter === 'PUBLISHED'} />
    </div>
  );
}
