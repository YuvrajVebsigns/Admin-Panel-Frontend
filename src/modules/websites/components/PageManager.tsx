'use client';
import React, { useState } from 'react';
import { useWebsitePages } from '../hooks/useWebsitePages';
import { WebsitePage, PageStatus } from '../types/cms.types';
import { DataTable } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { PageFormModal } from './PageFormModal';
import { Edit, Trash2, Copy, Globe, Lock, Plus, Search, Loader2 } from 'lucide-react';

interface PageManagerProps {
  siteId: string;
}

export const PageManager: React.FC<PageManagerProps> = ({ siteId }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<WebsitePage | null>(null);

  const { pages, isLoading, deletePage, publishPage, unpublishPage, duplicatePage } =
    useWebsitePages({
      siteId,
      search,
      status: status || undefined,
      page: 1,
      limit: 10,
    });

  const handleEdit = (pageItem: WebsitePage) => {
    setSelectedPage(pageItem);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      try {
        await deletePage(id);
      } catch (e) {}
    }
  };

  const handleTogglePublish = async (pageItem: WebsitePage) => {
    try {
      if (pageItem.status === PageStatus.PUBLISHED) {
        await unpublishPage(pageItem.id);
      } else {
        await publishPage(pageItem.id);
      }
    } catch (e) {}
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicatePage(id);
    } catch (e) {}
  };

  const columns = [
    {
      header: 'PAGE TITLE',
      accessor: (item: WebsitePage) => (
        <div className="flex flex-col">
          <span
            onClick={() => handleEdit(item)}
            className="font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
          >
            {item.title}
          </span>
          <span className="text-xs text-gray-400 font-medium">/{item.slug}</span>
        </div>
      ),
    },
    {
      header: 'PAGE TEMPLATE',
      accessor: (item: WebsitePage) => (
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 text-gray-600 dark:text-gray-300 rounded-md">
          {item.pageType?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'STATUS',
      accessor: (item: WebsitePage) => {
        const isPub = item.status === PageStatus.PUBLISHED;
        return (
          <Badge
            color={isPub ? 'success' : item.status === PageStatus.ARCHIVED ? 'error' : 'warning'}
          >
            {item.status}
          </Badge>
        );
      },
    },
    {
      header: 'HOMEPAGE',
      accessor: (item: WebsitePage) =>
        item.isHomepage ? (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-1 rounded-md">
            Active Home
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      header: 'UPDATED AT',
      accessor: (item: WebsitePage) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date(item.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: (item: WebsitePage) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleTogglePublish(item)}
            title={item.status === PageStatus.PUBLISHED ? 'Unpublish Page' : 'Publish Page'}
            className={`p-2 rounded-lg transition-colors border-none bg-transparent ${
              item.status === PageStatus.PUBLISHED
                ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                : 'text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900'
            }`}
          >
            {item.status === PageStatus.PUBLISHED ? <Globe size={16} /> : <Lock size={16} />}
          </button>

          <button
            onClick={() => handleDuplicate(item.id)}
            title="Duplicate Page"
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900 rounded-lg transition-colors border-none bg-transparent"
          >
            <Copy size={16} />
          </button>

          <button
            onClick={() => handleEdit(item)}
            title="Edit Details"
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-navy-900 rounded-lg transition-colors border-none bg-transparent"
          >
            <Edit size={16} />
          </button>

          <button
            onClick={() => handleDelete(item.id)}
            title="Delete Page"
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors border-none bg-transparent"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-navy-900/30 p-4 rounded-2xl border border-gray-100 dark:border-navy-700">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search website pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all dark:bg-navy-900 dark:border-navy-700 dark:text-white"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm dark:bg-navy-900 dark:border-navy-700 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          Create Page
        </Button>
      </div>

      {/* Pages Data Table */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Loading website pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3 border border-dashed border-gray-100 dark:border-navy-700 rounded-3xl bg-white dark:bg-navy-800">
          <p className="text-sm font-bold text-gray-400">No static pages found</p>
          <p className="text-xs text-gray-500">
            Create a page to structure custom template layouts.
          </p>
        </div>
      ) : (
        <DataTable<WebsitePage> data={pages} columns={columns} />
      )}

      {/* Page Form Modal */}
      <PageFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        siteId={siteId}
        pageData={selectedPage}
      />
    </div>
  );
};
