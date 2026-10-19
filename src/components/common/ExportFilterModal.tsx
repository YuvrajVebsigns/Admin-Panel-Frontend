'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { Calendar, Globe, Tag, Search, Download, Sparkles, Filter } from 'lucide-react';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import { Website } from '@/modules/websites/types/website.types';
import { ExportFilterParams } from '@/services/dataExport.service';

export interface ExportCustomFilterOption {
  key: keyof ExportFilterParams | string;
  label: string;
  icon?: React.ReactNode;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface SheetHighlightInfo {
  sheet: string;
  desc: string;
}

export interface ExportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onExport: (filters: ExportFilterParams) => Promise<void>;
  sheetsInfo?: SheetHighlightInfo[];

  // Configurable filter toggles
  showDateRange?: boolean;
  showWebsiteFilter?: boolean;
  showStatusFilter?: boolean;
  statusOptions?: Array<{ value: string; label: string }>;
  customFilters?: ExportCustomFilterOption[];

  // Initial values from active page state
  initialFilters?: ExportFilterParams;
}

export const ExportFilterModal: React.FC<ExportFilterModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onExport,
  sheetsInfo,
  showDateRange = true,
  showWebsiteFilter = false,
  showStatusFilter = false,
  statusOptions = [],
  customFilters = [],
  initialFilters = {},
}) => {
  const [startDate, setStartDate] = useState<string>(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState<string>(initialFilters.endDate || '');
  const [websiteId, setWebsiteId] = useState<string>(initialFilters.websiteId || '');
  const [status, setStatus] = useState<string>(initialFilters.status || '');
  const [search, setSearch] = useState<string>(initialFilters.search || '');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('all');

  const { websites, isLoading: isWebsitesLoading } = useWebsites({ limit: 100 });

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setSearch(initialFilters.search || '');
      setWebsiteId(initialFilters.websiteId || '');
      setStatus(initialFilters.status || '');
      setStartDate(initialFilters.startDate || '');
      setEndDate(initialFilters.endDate || '');

      const initialCustoms: Record<string, string> = {};
      customFilters.forEach((cf) => {
        const val = (initialFilters as Record<string, unknown>)[cf.key];
        if (val !== undefined && val !== null) {
          initialCustoms[cf.key as string] = String(val);
        }
      });
      setCustomValues(initialCustoms);

      if (initialFilters.startDate || initialFilters.endDate) {
        setActivePreset('custom');
      } else {
        setActivePreset('all');
      }
    }
  }, [isOpen, initialFilters, customFilters]);

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
      const exportParams: ExportFilterParams = {
        websiteId: websiteId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status || undefined,
        search: search.trim() || undefined,
        ...customValues,
      };

      await onExport(exportParams);
      onClose();
    } catch {
      // Notification is handled in onExport / dataExportService
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isExporting && onClose()}
      title={title}
      description={description || 'Choose the data to include in your Excel workbook.'}
      size="lg"
      className="max-h-[calc(100dvh-1.5rem)]"
    >
      <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto pr-1">
        {/* Filter Form */}
        <form onSubmit={handleExport} className="space-y-6">
          {/* Date Presets and Range */}
          {showDateRange && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-500" />
                  Date Range Filter
                </label>
                <span className="text-[11px] text-gray-400">Based on creation / log timestamp</span>
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
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
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block font-medium">
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
          )}

          {/* Website Filter */}
          {showWebsiteFilter && (
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
                    {ws.name} ({ws.domain || 'Portal'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status and Custom Filters Grid */}
          {(showStatusFilter || customFilters.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showStatusFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Filter size={14} className="text-brand-500" />
                    Status Filter
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] dark:border-navy-700 dark:bg-navy-800 dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {customFilters.map((cf) => (
                <div key={cf.key as string} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    {cf.icon || <Tag size={14} className="text-brand-500" />}
                    {cf.label}
                  </label>
                  <select
                    value={customValues[cf.key as string] || ''}
                    onChange={(e) =>
                      setCustomValues((prev) => ({
                        ...prev,
                        [cf.key as string]: e.target.value,
                      }))
                    }
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] dark:border-navy-700 dark:bg-navy-800 dark:text-white"
                  >
                    <option value="">{cf.placeholder || `All ${cf.label}s`}</option>
                    {cf.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Search Keyword Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Search size={14} className="text-brand-500" />
              Search Keyword Filter
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search keyword / name / email filter..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus-visible:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 motion-safe:transition-[border-color,box-shadow] dark:border-navy-700 dark:bg-navy-800 dark:text-white"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Sheet Highlights Card */}
          {sheetsInfo && sheetsInfo.length > 0 && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                Included in this Export Workbook
              </div>
              <div
                className={`grid grid-cols-1 ${
                  sheetsInfo.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                } gap-2.5 text-xs text-gray-600 dark:text-gray-400`}
              >
                {sheetsInfo.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white/80 dark:bg-navy-800/80 border border-gray-100 dark:border-navy-700"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white block mb-0.5">
                      {item.sheet}
                    </span>
                    {item.desc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
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
