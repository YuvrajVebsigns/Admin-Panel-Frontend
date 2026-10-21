'use client';

import React, { useState } from 'react';
import { FileBox, Plus, Search, Filter, RefreshCcw, LayoutGrid, List } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import { FileTable } from '@/modules/media/components/FileTable';
import { FileGrid } from '@/modules/media/components/FileGrid';
import { FileUploadModal } from '@/modules/media/components/FileUploadModal';

export default function FilesPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: '',
    module: '',
    visibility: '',
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
            <FileBox size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              File Manager
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Manage all your assets and media in one place
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setIsUploadOpen(true)}
            className="shadow-lg shadow-brand-500/20"
          >
            <Plus size={18} className="mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-theme-sm dark:bg-navy-800 dark:border-navy-700">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 dark:border-navy-700 p-6 gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search files by name..."
                value={params.search}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all dark:bg-navy-900 dark:text-white w-full"
              />
            </div>

            <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 dark:bg-navy-900 dark:text-gray-400 dark:hover:bg-navy-700 transition-all border-none">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-gray-50 dark:bg-navy-900 rounded-xl">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-brand-600 dark:bg-navy-800 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-brand-600 dark:bg-navy-800 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <button
              onClick={() => setParams({ ...params, page: 1 })}
              className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 dark:bg-navy-900 dark:text-gray-400 dark:hover:bg-navy-700 transition-all"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {view === 'list' ? (
            <FileTable
              params={params}
              onParamsChange={(newParams: unknown) => setParams(newParams as typeof params)}
            />
          ) : (
            <FileGrid
              params={params}
              onParamsChange={(newParams: unknown) => setParams(newParams as typeof params)}
            />
          )}
        </div>
      </div>

      {/* Upload Modal — rendered directly, not inside GlobalModal */}
      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
