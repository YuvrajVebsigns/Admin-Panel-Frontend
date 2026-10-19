'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { Calendar, Globe, Tag, Search, Download, Sparkles, Layers } from 'lucide-react';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Website } from '@/modules/websites/types/website.types';
import {
  useNominationCategories,
  useNominationSubCategories,
} from '../hooks/useNominationCategories';
import { dataExportService } from '@/services/dataExport.service';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'nominee' | 'nominator';
  initialSearch?: string;
  initialWebsiteId?: string;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  type,
  initialSearch = '',
  initialWebsiteId = '',
}) => {
  const [websiteId, setWebsiteId] = useState<string>(initialWebsiteId);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subCategoryId, setSubCategoryId] = useState<string>('');
  const [search, setSearch] = useState<string>(initialSearch);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('all');

  // Fetch dropdown data
  const { websites, isLoading: isWebsitesLoading } = useWebsites({ limit: 100 });
  const { categories, isLoading: isCategoriesLoading } = useNominationCategories({
    limit: 500,
    isActive: true,
  });
  const { subCategories, isLoading: isSubCategoriesLoading } = useNominationSubCategories({
    limit: 500,
    isActive: true,
    categoryId: categoryId || undefined,
  });

  // Sync initial props when opening
  useEffect(() => {
    if (isOpen) {
      setSearch(initialSearch || '');
      if (initialWebsiteId) {
        setWebsiteId(initialWebsiteId);
      }
    }
  }, [isOpen, initialSearch, initialWebsiteId]);

  // Reset subcategory if category changes
  useEffect(() => {
    setSubCategoryId('');
  }, [categoryId]);

  // Date Presets Handler
  const handleDatePreset = (preset: 'all' | 'today' | '7d' | '30d' | 'month' | 'year') => {
    setActivePreset(preset);
    const now = new Date();
    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (preset === 'today') {
      const todayStr = toDateStr(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
      return;
    }

    if (preset === '7d') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(toDateStr(past));
      setEndDate(toDateStr(now));
      return;
    }

    if (preset === '30d') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      setStartDate(toDateStr(past));
      setEndDate(toDateStr(now));
      return;
    }

    if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toDateStr(firstDay));
      setEndDate(toDateStr(now));
      return;
    }

    if (preset === 'year') {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(toDateStr(firstDayOfYear));
      setEndDate(toDateStr(now));
      return;
    }
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    try {
      const exportParams = {
        websiteId: websiteId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        categoryId: categoryId || undefined,
        subCategoryId: subCategoryId || undefined,
        search: search.trim() || undefined,
      };

      if (type === 'nominee') {
        await dataExportService.exportNominees(exportParams);
      } else {
        await dataExportService.exportNominators(exportParams);
      }

      onClose();
    } catch {
      // Export error notification is handled by dataExportService
    } finally {
      setIsExporting(false);
    }
  };

  const isNominee = type === 'nominee';

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isExporting && onClose()}
      title={isNominee ? 'Export nominee voting data' : 'Export nominator activity data'}
      description="Configure filters and download a detailed Excel workbook."
      size="lg"
      className="max-h-[calc(100dvh-1.5rem)]"
    >
      <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto pr-1">
        <form onSubmit={handleExport} className="space-y-6">
          {/* Date Presets and Range */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-brand-500" />
                Date Range Filter
              </label>
              <span className="text-[11px] text-gray-400">Based on submission date</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: 'Last 7 Days' },
                  { id: '30d', label: 'Last 30 Days' },
                  { id: 'month', label: 'This Month' },
                  { id: 'year', label: 'This Year' },
                ] as const
              ).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleDatePreset(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activePreset === p.id
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Start Date (From)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActivePreset('custom');
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] dark:border-navy-700 dark:bg-navy-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  End Date (To)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActivePreset('custom');
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] dark:border-navy-700 dark:bg-navy-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Website Source */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Globe size={14} className="text-brand-500" />
              Website Source
            </label>
            <select
              value={websiteId}
              onChange={(e) => setWebsiteId(e.target.value)}
              disabled={isWebsitesLoading}
              className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] disabled:opacity-50 dark:border-navy-700 dark:bg-navy-800 dark:text-white"
            >
              <option value="">All Websites</option>
              {websites?.map((ws: Website) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.domain || 'Domain'})
                </option>
              ))}
            </select>
          </div>

          {/* Category and Sub-category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Tag size={14} className="text-brand-500" />
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isCategoriesLoading}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] disabled:opacity-50 dark:border-navy-700 dark:bg-navy-800 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Layers size={14} className="text-brand-500" />
                Sub-Category
              </label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                disabled={isSubCategoriesLoading || (!categoryId && !subCategories.length)}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] disabled:opacity-50 dark:border-navy-700 dark:bg-navy-800 dark:text-white"
              >
                <option value="">All Sub-Categories</option>
                {subCategories.map((sub) => (
                  <option key={sub.id || sub._id} value={sub.id || sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Keyword */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Search size={14} className="text-brand-500" />
              Specific Keyword / Person Filter
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by contact name, email, organization, or city..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] dark:border-navy-700 dark:bg-navy-800 dark:text-white"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Formula & Analytical Feature Highlights */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
              <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
              Included in this Export Workbook
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-navy-800/80 border border-gray-100 dark:border-navy-700">
                <span className="font-semibold text-gray-900 dark:text-white block mb-0.5">
                  Sheet 1: Analytics
                </span>
                Executive KPI metrics driven by formulas (=IF, =SUM, =COUNTA).
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-navy-800/80 border border-gray-100 dark:border-navy-700">
                <span className="font-semibold text-gray-900 dark:text-white block mb-0.5">
                  Sheet 2: Directory
                </span>
                Voting tally, approval rates, performance tiers & summary row.
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-navy-800/80 border border-gray-100 dark:border-navy-700">
                <span className="font-semibold text-gray-900 dark:text-white block mb-0.5">
                  Sheet 3: Audit Log
                </span>
                Full point-in-time snapshot of submissions & contact details.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
              className="w-full rounded-xl px-5 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isExporting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {isExporting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Excel Sheet...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export Excel File
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
