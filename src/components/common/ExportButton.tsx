'use client';

import React, { useState } from 'react';
import { Loader2, FileSpreadsheet } from 'lucide-react';
import {
  ExportFilterModal,
  ExportCustomFilterOption,
  SheetHighlightInfo,
} from './ExportFilterModal';
import { ExportFilterParams } from '@/services/dataExport.service';
import { useHasPermission } from '@/lib/permissions';

export interface ExportButtonProps {
  permission?: string;
  onExport: (filters?: ExportFilterParams) => Promise<void> | void;
  label?: string;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
  tooltip?: string;
  showIconOnly?: boolean;

  // Filter Modal Configurations
  disableModal?: boolean;
  exportTitle?: string;
  exportDescription?: string;
  sheetsInfo?: SheetHighlightInfo[];
  showDateRange?: boolean;
  showWebsiteFilter?: boolean;
  showStatusFilter?: boolean;
  statusOptions?: Array<{ value: string; label: string }>;
  customFilters?: ExportCustomFilterOption[];
  initialFilters?: ExportFilterParams;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  permission,
  onExport,
  label = 'Export to Excel',
  variant = 'outline',
  size = 'md',
  className = '',
  disabled = false,
  tooltip = 'Configure filters and export table data to Excel (.xlsx)',
  showIconOnly = false,

  disableModal = false,
  exportTitle = 'Export Data to Excel',
  exportDescription,
  sheetsInfo,
  showDateRange = true,
  showWebsiteFilter = false,
  showStatusFilter = false,
  statusOptions = [],
  customFilters = [],
  initialFilters = {},
}) => {
  const isAllowed = useHasPermission(permission || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDirectExporting, setIsDirectExporting] = useState(false);

  if (permission && !isAllowed) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isDirectExporting) return;

    if (disableModal) {
      try {
        setIsDirectExporting(true);
        await onExport(initialFilters);
      } catch {
        // Export error notification is handled by the export service
      } finally {
        setIsDirectExporting(false);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm border border-transparent dark:bg-brand-500 dark:hover:bg-brand-600';
      case 'secondary':
        return 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-transparent dark:bg-emerald-500 dark:hover:bg-emerald-600';
      case 'ghost':
        return 'text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-brand-400 dark:hover:bg-navy-800 border border-transparent';
      case 'outline':
      default:
        return 'bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-navy-800 hover:border-gray-300 dark:hover:border-navy-700 shadow-xs';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded-xl gap-1.5';
      case 'md':
      default:
        return 'px-4 py-2.5 text-sm rounded-2xl gap-2';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isDirectExporting}
        title={tooltip}
        className={`inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      >
        {isDirectExporting ? (
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin text-brand-500" />
        ) : (
          <FileSpreadsheet
            size={size === 'sm' ? 14 : 16}
            className="text-emerald-600 dark:text-emerald-400 shrink-0"
          />
        )}
        {!showIconOnly && <span>{isDirectExporting ? 'Exporting...' : label}</span>}
      </button>

      {!disableModal && (
        <ExportFilterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={exportTitle}
          description={exportDescription}
          onExport={async (filters) => {
            await onExport(filters);
          }}
          sheetsInfo={sheetsInfo}
          showDateRange={showDateRange}
          showWebsiteFilter={showWebsiteFilter}
          showStatusFilter={showStatusFilter}
          statusOptions={statusOptions}
          customFilters={customFilters}
          initialFilters={initialFilters}
        />
      )}
    </>
  );
};
