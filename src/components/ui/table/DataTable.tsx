'use client';

import React, { useId, useMemo, useState } from 'react';
import { ArrowLeftRight, Search, X } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from './index';
import Pagination from '@/components/tables/Pagination';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T, rowIndex: number) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  itemsPerPage?: number;
  isLoading?: boolean;
  actions?: React.ReactNode;
  serverSide?: boolean;
  totalItems?: number;
  page?: number;
  limit?: number;
  search?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (search: string) => void;
}

function matchesSearch(value: unknown, term: string): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' || typeof value === 'number')
    return String(value).toLowerCase().includes(term);
  if (typeof value === 'object')
    return Object.values(value).some((entry) => matchesSearch(entry, term));
  return false;
}

export function DataTable<T extends object>({
  data,
  columns,
  searchPlaceholder = 'Search records…',
  itemsPerPage = 10,
  isLoading = false,
  actions,
  serverSide = false,
  totalItems,
  page,
  limit,
  search,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
}: DataTableProps<T>) {
  const id = useId();
  const [searchBuffer, setSearchBuffer] = useState(search ?? '');
  const [searchTermState, setSearchTermState] = useState('');
  const [currentPageState, setCurrentPageState] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(itemsPerPage);

  React.useEffect(() => {
    if (search !== undefined) setSearchBuffer(search);
  }, [search]);

  const currentSearchTerm = onSearchChange ? searchBuffer : searchTermState;
  const requestedPage = onPageChange ? (page ?? 1) : currentPageState;
  const pageSize = Math.max(1, onPageSizeChange ? (limit ?? itemsPerPage) : pageSizeState);
  const filteredData = useMemo(
    () =>
      serverSide || !currentSearchTerm.trim()
        ? data
        : data.filter((item) => matchesSearch(item, currentSearchTerm.trim().toLowerCase())),
    [data, currentSearchTerm, serverSide],
  );
  const totalCount = Math.max(0, serverSide ? (totalItems ?? 0) : filteredData.length);
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = serverSide
    ? Math.max(1, requestedPage)
    : Math.min(Math.max(1, requestedPage), Math.max(1, totalPages));
  const paginatedData = useMemo(
    () =>
      serverSide ? data : filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [data, filteredData, serverSide, currentPage, pageSize],
  );
  const sizes = Array.from(new Set([5, 10, 20, 50, pageSize])).sort((a, b) => a - b);
  const changePage = (nextPage: number) => {
    if (onPageChange) onPageChange(nextPage);
    else setCurrentPageState(nextPage);
  };
  const changeSearch = (value: string) => {
    if (onSearchChange) {
      setSearchBuffer(value);
      onSearchChange(value);
    } else {
      setSearchTermState(value);
      setCurrentPageState(1);
    }
  };
  const firstRecord = paginatedData.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastRecord = paginatedData.length
    ? Math.min((currentPage - 1) * pageSize + paginatedData.length, totalCount)
    : 0;

  return (
    <section
      aria-label="Records"
      aria-busy={isLoading}
      className="admin-surface min-w-0 rounded-xl border border-navy-100 bg-white shadow-theme-xs dark:border-navy-800 dark:bg-navy-900"
    >
      <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:p-5">
        <div className="flex shrink-0 items-center gap-2.5 text-sm text-navy-500 dark:text-navy-300">
          <label htmlFor={`${id}-size`}>Rows per page</label>
          <select
            id={`${id}-size`}
            value={pageSize}
            onChange={(event) => {
              const size = Number(event.target.value);
              if (onPageSizeChange) onPageSizeChange(size);
              else {
                setPageSizeState(size);
                setCurrentPageState(1);
              }
            }}
            className="h-11 min-w-20 rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-800 focus:border-brand-500 dark:border-navy-700 dark:bg-navy-800 dark:text-white"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-3 sm:w-auto">
          <div className="relative w-full sm:w-72">
            <label htmlFor={`${id}-search`} className="sr-only">
              {searchPlaceholder}
            </label>
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"
            />
            <input
              id={`${id}-search`}
              type="search"
              placeholder={searchPlaceholder}
              value={currentSearchTerm}
              onChange={(event) => changeSearch(event.target.value)}
              className="h-11 w-full rounded-lg border border-navy-200 bg-white pl-11 pr-11 text-sm text-navy-800 placeholder:text-navy-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-navy-700 dark:bg-navy-800 dark:text-white"
            />
            {currentSearchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => changeSearch('')}
                className="admin-action absolute right-0 top-0 flex size-11 items-center justify-center rounded-lg text-navy-400 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-safe:transition-colors"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          {actions}
        </div>
      </div>
      <p
        id={`${id}-scroll-hint`}
        className={`${isLoading || !paginatedData.length ? 'sr-only' : 'flex md:hidden'} items-center gap-2 border-t border-navy-100 bg-navy-25 px-4 py-2.5 text-xs text-navy-500 dark:border-navy-800 dark:bg-navy-800 dark:text-navy-300`}
      >
        <ArrowLeftRight size={15} aria-hidden="true" />
        Scroll horizontally to view all columns and actions.
      </p>
      <div
        role="region"
        aria-label="Scrollable records table"
        aria-describedby={`${id}-scroll-hint`}
        tabIndex={0}
        className="max-w-full overflow-x-auto rounded-sm custom-scrollbar"
      >
        <Table
          className={`${isLoading || !paginatedData.length ? 'min-w-full' : 'min-w-[720px]'} border-collapse border-y border-navy-100 text-left text-sm tabular-nums dark:border-navy-800`}
        >
          <caption className="sr-only">
            Records. Use the search field to filter results and pagination to browse pages.
          </caption>
          <TableHeader
            className={`${isLoading || !paginatedData.length ? 'hidden' : ''} border-b border-navy-100 bg-navy-25 dark:border-navy-800 dark:bg-navy-800/60`}
          >
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  isHeader
                  className={`px-5 py-3.5 text-left text-xs font-semibold text-navy-500 dark:text-navy-300 ${column.className ?? ''}`}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="admin-records-enter divide-y divide-navy-100 dark:divide-navy-800">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={Math.max(1, columns.length)} className="px-5 py-16 text-center">
                  <div
                    role="status"
                    className="flex flex-col items-center gap-3 text-sm text-navy-500 dark:text-navy-300"
                  >
                    <span
                      aria-hidden="true"
                      className="size-7 animate-spin rounded-full border-2 border-navy-100 border-t-brand-500 motion-reduce:animate-none dark:border-navy-700 dark:border-t-brand-400"
                    />
                    Loading records…
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Math.max(1, columns.length)} className="px-5 py-16 text-center">
                  <div role="status">
                    <p className="font-roboto text-base font-semibold text-navy-800 dark:text-white">
                      {currentSearchTerm ? 'No matching records' : 'No records yet'}
                    </p>
                    <p className="mt-1.5 text-sm text-navy-500 dark:text-navy-300">
                      {currentSearchTerm
                        ? 'Try another keyword or clear your search.'
                        : 'Records will appear here when they are available.'}
                    </p>
                    {currentSearchTerm && (
                      <button
                        type="button"
                        onClick={() => changeSearch('')}
                        className="admin-action mt-3 min-h-11 rounded-lg px-4 text-sm font-semibold text-brand-600 hover:bg-brand-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 motion-safe:transition-colors dark:text-brand-300 dark:hover:bg-brand-500/10"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="admin-record-row hover:bg-navy-25 focus-within:bg-brand-25 motion-safe:transition-colors dark:hover:bg-navy-800/40 dark:focus-within:bg-brand-500/10"
                >
                  {columns.map((column, columnIndex) => (
                    <TableCell
                      key={columnIndex}
                      className={`px-5 py-4 align-middle text-navy-700 dark:text-navy-200 ${column.className ?? ''}`}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(item, (currentPage - 1) * pageSize + rowIndex + 1)
                        : (item[column.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:p-5">
        <p aria-live="polite" className="text-sm tabular-nums text-navy-500 dark:text-navy-300">
          {isLoading
            ? 'Updating records…'
            : `${firstRecord}–${lastRecord} of ${totalCount} records`}
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={changePage}
          disabled={isLoading}
        />
      </div>
    </section>
  );
}
