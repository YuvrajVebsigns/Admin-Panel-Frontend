'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import {
  FileSpreadsheet,
  Calendar,
  Globe,
  Tag,
  Search,
  Download,
  Filter,
  Sparkles,
  Layers,
} from 'lucide-react';
import { NominationStatus } from '../types/nomination.types';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Website } from '@/modules/websites/types/website.types';
import {
  useNominationCategories,
  useNominationSubCategories,
} from '../hooks/useNominationCategories';
import { nominationService } from '@/services/nomination.service';
import toast from 'react-hot-toast';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'nominee' | 'nominator';
  initialSearch?: string;
  initialStatus?: NominationStatus;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  type,
  initialSearch = '',
  initialStatus,
}) => {
  const [websiteId, setWebsiteId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>(initialStatus || '');
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
  const { data: subCategoriesData, isLoading: isSubCategoriesLoading } = useNominationSubCategories(
    {
      limit: 500,
      isActive: true,
      categoryId: categoryId || undefined,
    },
  );

  // Sync initial props when opening
  useEffect(() => {
    if (isOpen) {
      setSearch(initialSearch || '');
      setStatus(initialStatus || '');
    }
  }, [isOpen, initialSearch, initialStatus]);

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
        status: (status as NominationStatus) || undefined,
        categoryId: categoryId || undefined,
        subCategoryId: subCategoryId || undefined,
        search: search.trim() || undefined,
      };

      if (type === 'nominee') {
        await nominationService.exportNominees(exportParams);
        toast.success('Nominee voting data exported successfully!');
      } else {
        await nominationService.exportNominators(exportParams);
        toast.success('Nominator submission data exported successfully!');
      }

      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to export Excel spreadsheet. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  const isNominee = type === 'nominee';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isExporting && onClose()}
      size="lg"
      className="p-0 overflow-hidden"
    >
      <div className="bg-white dark:bg-navy-900 border-b border-gray-100 dark:border-navy-800 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isNominee ? 'Export Nominee Voting Data' : 'Export Nominator Activity Data'}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200/60 dark:border-brand-500/20">
                  Excel .xlsx
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isNominee
                  ? 'Generate an analytical spreadsheet with live formulas, voting tallies, and audit logs.'
                  : 'Generate an activity spreadsheet with candidate counts, approval rates, and snapshot logs.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleExport} className="p-6 sm:p-7 space-y-6">
        {/* Date Presets and Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
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
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
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
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Website and Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="">All Websites</option>
              {websites?.map((ws: Website) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.domain || 'Domain'})
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Filter size={14} className="text-brand-500" />
              Nomination Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value={NominationStatus.APPROVED}>Approved Only</option>
              <option value={NominationStatus.PENDING}>Pending Only</option>
              <option value={NominationStatus.REVIEWED}>Reviewed Only</option>
              <option value={NominationStatus.REJECTED}>Rejected Only</option>
            </select>
          </div>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer disabled:opacity-50"
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
              disabled={isSubCategoriesLoading || (!categoryId && !subCategoriesData?.data?.length)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="">All Sub-Categories</option>
              {subCategoriesData?.data?.map((sub) => (
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Formula & Analytical Feature Highlights */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-emerald-50/40 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border border-indigo-100/80 dark:border-navy-800 space-y-2.5">
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
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="px-5 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isExporting}
            className="px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 font-medium"
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
    </Modal>
  );
};
