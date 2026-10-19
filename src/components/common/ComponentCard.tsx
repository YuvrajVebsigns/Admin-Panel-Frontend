import React from 'react';

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = '',
  desc = '',
}) => {
  return (
    <div
      className={`admin-surface min-w-0 rounded-xl border border-navy-100 bg-white shadow-theme-xs dark:border-navy-800 dark:bg-navy-900 ${className}`}
    >
      {/* Card Header */}
      <div className="admin-section-heading px-4 py-5 sm:px-6">
        <h2 className="text-base font-semibold leading-6 text-navy-800 dark:text-navy-100">
          {title}
        </h2>
        {desc && (
          <p className="mt-1.5 max-w-prose text-sm leading-6 text-navy-500 dark:text-navy-300">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="border-t border-navy-100 p-4 dark:border-navy-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
