import React from 'react';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgIllustration?: React.ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  onClick?: () => void;
  isActive?: boolean;
  description?: string;
  isLoading?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconTextColor,
  onClick,
  isActive = false,
  description,
  isLoading = false,
}) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span aria-hidden="true" className="mb-3 block h-0.5 w-6 bg-brand-500" />
          <h3 className="text-sm font-medium leading-snug text-navy-600 dark:text-navy-200">
            {title}
          </h3>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBgColor} ${iconTextColor}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      {isLoading ? (
        <div
          className="mt-2 h-9 w-20 animate-pulse rounded bg-gray-100 motion-reduce:animate-none dark:bg-navy-700"
          aria-label="Loading metric"
        />
      ) : (
        <p className="mt-3 break-words font-roboto text-3xl font-semibold leading-tight tabular-nums text-gray-900 dark:text-white sm:text-4xl">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      )}
      {description && (
        <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </>
  );
  const className = `admin-surface min-w-0 rounded-xl border bg-white p-5 text-left dark:bg-navy-800 sm:p-6 ${isActive ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-100 dark:border-navy-700'}`;

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`${className} admin-action w-full hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-safe:transition-[border-color,box-shadow,transform] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-theme-sm dark:focus-visible:ring-offset-navy-900`}
    >
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
};
