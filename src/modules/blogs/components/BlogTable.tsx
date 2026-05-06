import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Blog } from '../types/blog.types';
import { WebsiteStatusIndicator } from './WebsiteStatusIndicator';
import { FileText, Edit, Loader2 } from 'lucide-react';
import { useBlogs } from '../hooks/useBlogs';
import { useRouter } from 'next/navigation';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { useDebounce } from '@/hooks/useDebounce';

interface BlogTableProps {
  websiteId?: string;
  isActiveFilter?: boolean;
}

export const BlogTable: React.FC<BlogTableProps> = ({ websiteId, isActiveFilter }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { websites: allWebsites } = useWebsites({ limit: 100 });
  const { blogs, isLoading } = useBlogs({
    limit: 100,
    websiteId,
    isActive: isActiveFilter,
    search: debouncedSearchTerm || undefined,
  });

  const columns: Column<Blog>[] = [
    {
      header: 'BLOG TITLE',
      accessor: (blog) => (
        <div
          className="flex items-center gap-4 py-2 group cursor-pointer"
          onClick={() => router.push(`/blogs/update/${blog.id}`)}
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-300">
            <FileText size={20} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors duration-300">
              {blog.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {blog.excerpt?.substring(0, 60)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'WEBSITES',
      accessor: (blog) => {
        // Extract IDs from populated objects if needed
        const blogWebsiteIds = (blog.websites || []).map((w) =>
          typeof w === 'string' ? w : w.id || w._id,
        );
        const statusArray = allWebsites.slice(0, 11).map((w) => blogWebsiteIds.includes(w.id));
        return <WebsiteStatusIndicator status={statusArray} />;
      },
    },
    {
      header: 'STATUS',
      accessor: (blog) => (
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            blog.isActive
              ? 'bg-green-50 text-green-600 dark:bg-green-500/10'
              : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'
          }`}
        >
          {blog.isActive ? 'PUBLISHED' : 'DRAFT'}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: (blog) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/blogs/update/${blog.id}`)}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Edit size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <DataTable
        columns={columns}
        data={blogs}
        searchPlaceholder="Search blogs..."
        search={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
};
