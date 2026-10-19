import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const count = Math.max(0, Math.floor(totalPages));
  const activePage = Math.min(Math.max(1, currentPage), Math.max(1, count));
  const start = Math.max(1, Math.min(activePage - 1, count - 2));
  const pages = Array.from({ length: Math.min(3, count) }, (_, index) => start + index);
  const buttonClass =
    'admin-action flex size-11 shrink-0 items-center justify-center rounded-lg border border-navy-100 text-sm font-semibold text-navy-600 hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 motion-safe:transition-colors dark:border-navy-700 dark:text-navy-200 dark:hover:bg-navy-800 dark:focus-visible:ring-offset-navy-900';

  return (
    <nav aria-label="Pagination" className="flex max-w-full flex-wrap items-center gap-1.5">
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => onPageChange(activePage - 1)}
        disabled={disabled || activePage <= 1 || count === 0}
        className={buttonClass}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
      {start > 1 && (
        <span className="hidden px-1 text-navy-400 sm:inline" aria-hidden="true">
          …
        </span>
      )}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          aria-label={`Page ${page}`}
          aria-current={page === activePage ? 'page' : undefined}
          disabled={disabled}
          onClick={() => onPageChange(page)}
          className={
            page === activePage
              ? 'admin-action flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 motion-safe:transition-colors dark:focus-visible:ring-offset-navy-900'
              : buttonClass
          }
        >
          {page}
        </button>
      ))}
      {start + pages.length <= count && (
        <span className="hidden px-1 text-navy-400 sm:inline" aria-hidden="true">
          …
        </span>
      )}
      <button
        type="button"
        aria-label="Next page"
        onClick={() => onPageChange(activePage + 1)}
        disabled={disabled || activePage >= count || count === 0}
        className={buttonClass}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}
