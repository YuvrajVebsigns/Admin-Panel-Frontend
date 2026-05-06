'use client';
import React, { useState } from 'react';
import { Website } from '../types/website.types';
import { useWebsites } from '../hooks/useWebsites';
import { useBlogs } from '@/modules/blogs/hooks/useBlogs';
import { Edit, Trash2, ExternalLink, MoveRight, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { useAuthStore } from '@/store/auth.store';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export const WebsiteTable: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { confirm } = useGlobalModal();
  const isSuperAdmin = user?.role?.roleKey === 'super_admin';

  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { websites, meta, isLoading, updateWebsite, deleteWebsite } = useWebsites(params);

  const { blogs: allBlogs } = useBlogs({ limit: 1000 });

  const blogCountsByWebsite = React.useMemo(() => {
    const counts: Record<string, number> = {};
    if (allBlogs) {
      allBlogs.forEach((blog) => {
        blog.websites?.forEach((w) => {
          const id = typeof w === 'string' ? w : ((w.id || w._id) as string);
          if (id) counts[id] = (counts[id] || 0) + 1;
        });
      });
    }
    return counts;
  }, [allBlogs]);

  const handleToggleActive = async (website: Website) => {
    await updateWebsite({ id: website.id, data: { isActive: !website.isActive } });
  };

  const handleDelete = (website: Website) => {
    confirm({
      title: 'Delete Website',
      message: `Are you sure you want to delete "${website.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        await deleteWebsite(website.id);
      },
    });
  };

  const columns: Column<Website>[] = [
    {
      header: 'PLATFORM',
      accessor: (website) => (
        <div className="flex items-center gap-4 py-1">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center border border-brand-100 dark:border-brand-500/20">
            {website.logo ? (
              <Image src={website.logo} alt={website.name} fill className="object-contain p-2" />
            ) : (
              <Search className="w-5 h-5 text-brand-500" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white mb-0.5">{website.name}</p>
            <a
              href={website.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              {website.domain.replace(/^https?:\/\//, '')}
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      ),
    },
    {
      header: 'CONTENT METRICS',
      accessor: (website) => (
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-1 uppercase">
              Blogs
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white leading-none">
              {blogCountsByWebsite[website.id] || 0}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-1 uppercase">
              Events
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white leading-none">0</p>
          </div>
        </div>
      ),
    },
    {
      header: 'STATUS',
      accessor: (website) => (
        <button
          onClick={() => handleToggleActive(website)}
          className={`group relative overflow-hidden flex items-center justify-center px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-colors duration-300 min-w-[100px] ${
            website.isActive
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/15 dark:hover:text-success-500'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {website.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {website.isActive ? 'Deactivate' : 'Activate'}
          </span>
          <span className="invisible whitespace-nowrap">
            {website.isActive ? 'Deactivate' : 'Activate'}
          </span>
        </button>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: (website) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push(`/websites/update/${website.id}`)}
            className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-md transition-colors"
            title="Edit Website"
          >
            <Edit size={16} />
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleDelete(website)}
              className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-md transition-colors"
              title="Delete Website"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'NAVIGATION',
      accessor: (website) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/websites/dashboard/${website.id}`)}
            className="text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            Dashboard
            <MoveRight size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={websites}
        isLoading={isLoading}
        serverSide
        totalItems={meta?.total}
        page={params.page}
        limit={params.limit}
        search={params.search}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) => setParams((prev) => ({ ...prev, limit, page: 1 }))}
        onSearchChange={(search) => setParams((prev) => ({ ...prev, search, page: 1 }))}
      />
    </>
  );
};
