'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { FileGrid } from './FileGrid';

import Select from '@/components/form/Select';
import { FileData } from '../types/file.types';

interface FileBrowserProps {
  onSelect?: (file: FileData) => void;
  initialModule?: string;
  initialFileType?: string;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  onSelect,
  initialModule = '',
  initialFileType = '',
}) => {
  const [params, setParams] = useState({
    search: '',
    module: initialModule,
    fileType: initialFileType,
    sort: 'createdAt:desc',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 15,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleModuleChange = (value: string) => {
    setParams((prev) => ({ ...prev, module: value === 'all' ? '' : value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    setParams((prev) => ({ ...prev, sort: value, page: 1 }));
  };

  const clearFilters = () => {
    setParams({
      search: '',
      module: '',
      fileType: initialFileType,
      sort: 'createdAt:desc',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 15,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Compact Filters Bar */}
      <div className="bg-white dark:bg-navy-800 p-4 rounded-2xl border border-gray-100 dark:border-navy-700 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name, ID or keywords..."
              value={params.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-navy-900 border border-transparent focus:border-brand-500/30 focus:bg-white dark:focus:bg-navy-800 rounded-xl transition-all outline-none text-sm font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <Select
                value={params.module || 'all'}
                onChange={handleModuleChange}
                options={[
                  { value: 'all', label: 'All Modules' },
                  { value: 'blogs', label: 'Blogs' },
                  { value: 'media', label: 'Media' },
                  { value: 'websites', label: 'Websites' },
                ]}
                className="w-full"
              />
            </div>
            <div className="w-40">
              <Select
                value={params.sort}
                onChange={handleSortChange}
                options={[
                  { value: 'createdAt:desc', label: 'Newest First' },
                  { value: 'createdAt:asc', label: 'Oldest First' },
                  { value: 'size:desc', label: 'Largest First' },
                ]}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-50 dark:border-navy-700">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Calendar size={14} />
            Date Range:
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={params.startDate}
              onChange={(e) => setParams((p) => ({ ...p, startDate: e.target.value, page: 1 }))}
              className="bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 px-3 py-1.5 rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-brand-500/20"
            />
            <span className="text-gray-300">to</span>
            <input
              type="date"
              value={params.endDate}
              onChange={(e) => setParams((p) => ({ ...p, endDate: e.target.value, page: 1 }))}
              className="bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 px-3 py-1.5 rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(params.search || params.module || params.startDate || params.endDate) && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">
            Active Filters:
          </span>
          {params.search && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[11px] font-bold rounded-lg border border-brand-100 dark:border-brand-500/20">
              <Search size={10} />"{params.search}"
              <button
                onClick={() => setParams((p) => ({ ...p, search: '' }))}
                className="hover:text-brand-700"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {params.module && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-lg border border-blue-100 dark:border-blue-500/20">
              <Filter size={10} />
              {params.module}
              <button
                onClick={() => setParams((p) => ({ ...p, module: '' }))}
                className="hover:text-blue-700"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {(params.startDate || params.endDate) && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold rounded-lg border border-purple-100 dark:border-purple-500/20">
              <Calendar size={10} />
              {params.startDate || '...'} to {params.endDate || '...'}
              <button
                onClick={() => setParams((p) => ({ ...p, startDate: '', endDate: '' }))}
                className="hover:text-purple-700"
              >
                <X size={12} />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-[11px] font-bold text-gray-400 hover:text-error-500 transition-colors ml-2"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Grid Content */}
      <div className="min-h-[400px]">
        <FileGrid params={params} onSelect={onSelect} />
      </div>
    </div>
  );
};
