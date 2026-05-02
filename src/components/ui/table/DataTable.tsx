'use client';
import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from './index';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  itemsPerPage?: number;
  isLoading?: boolean;
  // Server-side props
  serverSide?: boolean;
  totalItems?: number;
  page?: number;
  limit?: number;
  search?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (search: string) => void;
}

export function DataTable<T extends object>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  itemsPerPage = 10,
  isLoading = false,
  serverSide = false,
  totalItems,
  page,
  limit,
  search,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
}: DataTableProps<T>) {
  const [searchBuffer, setSearchBuffer] = useState(search ?? '');
  const [searchTermState, setSearchTermState] = useState('');
  const [currentPageState, setCurrentPageState] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(itemsPerPage);

  // Sync internal search buffer with prop if changed externally
  React.useEffect(() => {
    if (search !== undefined) {
      setSearchBuffer(search);
    }
  }, [search]);

  const currentSearchTerm = onSearchChange !== undefined ? searchBuffer : searchTermState;
  const currentPage = onPageChange !== undefined ? (page ?? 1) : currentPageState;
  const pageSize = onPageSizeChange !== undefined ? (limit ?? itemsPerPage) : pageSizeState;

  const filteredData = useMemo(() => {
    if (serverSide) return data;
    if (!searchTermState) return data;
    const lowerSearchTerm = searchTermState.toLowerCase();
    return data.filter((item) => {
      const searchInObject = (obj: unknown): boolean => {
        if (obj === null || obj === undefined) return false;
        if (typeof obj === 'string' || typeof obj === 'number') {
          return obj.toString().toLowerCase().includes(lowerSearchTerm);
        }
        if (typeof obj === 'object') {
          return Object.values(obj).some(searchInObject);
        }
        return false;
      };
      return searchInObject(item);
    });
  }, [data, searchTermState, serverSide]);

  const totalCount = serverSide ? totalItems || 0 : filteredData.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, serverSide, data]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-default">
      {/* Top Bar: Show Entries (Left) | Search (Right) */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-7.5 py-6 gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Show</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (onPageSizeChange) {
                  onPageSizeChange(newSize);
                } else {
                  setPageSizeState(newSize);
                  setCurrentPageState(1);
                }
              }}
              className="appearance-none bg-transparent border border-gray-200 dark:border-gray-700 rounded-md pl-3 pr-8 py-1.5 text-sm font-medium outline-none focus:border-brand-500 transition-all min-w-[70px]"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size} className="dark:bg-gray-900">
                  {size}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 4L5 6.5L7.5 4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">entries</span>
        </div>

        <div className="relative w-full sm:max-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md bg-transparent text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-all"
            placeholder={searchPlaceholder}
            value={currentSearchTerm}
            onChange={(e) => {
              const value = e.target.value;
              if (onSearchChange) {
                setSearchBuffer(value); // Update local buffer immediately for responsiveness
                onSearchChange(value); // Notify parent
              } else {
                setSearchTermState(value);
                setCurrentPageState(1);
              }
            }}
          />
        </div>
      </div>

      {/* Table Section - Crisp border-collapse layout */}
      <div className="overflow-x-auto">
        <Table className="border-collapse border-y border-gray-100 dark:border-gray-800">
          <TableHeader className="border-b border-gray-100 dark:border-gray-800">
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  isHeader
                  className={`px-7.5 py-4 text-sm font-semibold text-gray-900 dark:text-white ${col.className}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {col.header}
                    {col.sortable !== false && (
                      <ChevronsUpDown
                        size={14}
                        className="text-gray-300 dark:text-gray-600 shrink-0"
                      />
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-7.5 py-16 text-center">
                  <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-7.5 py-16 text-center text-sm text-gray-500 italic"
                >
                  No matching entries found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className={`px-7.5 py-4 align-middle ${col.className}`}>
                      {typeof col.accessor === 'function' ? (
                        col.accessor(item)
                      ) : (
                        <span className="text-[14px] font-medium text-gray-700 dark:text-gray-300">
                          {item[col.accessor as keyof T] as unknown as React.ReactNode}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer: Info (Left) | Controls (Right) */}
      <div className="flex flex-col md:flex-row justify-between items-center px-7.5 py-5 gap-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Showing {totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onPageChange) onPageChange(currentPage - 1);
              else setCurrentPageState((p) => Math.max(1, p - 1));
            }}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Simple pagination logic for 5 pages max visible
              if (totalPages > 5 && Math.abs(currentPage - pageNum) > 2) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    if (onPageChange) onPageChange(pageNum);
                    else setCurrentPageState(pageNum);
                  }}
                  className={`flex items-center justify-center w-9 h-9 rounded-md text-sm font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (onPageChange) onPageChange(currentPage + 1);
              else setCurrentPageState((p) => Math.min(totalPages, p + 1));
            }}
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
