import React from 'react';

export interface WebsiteCardProps {
  index: number;
  title: string;
  status: 'ACTIVE' | 'INACTIVE';
  blogsCount: number;
  eventsCount: number;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({
  index,
  title,
  status,
  blogsCount,
  eventsCount,
}) => {
  return (
    <div className="flex flex-col p-5 bg-white border border-gray-100 rounded-2xl shadow-theme-sm hover:shadow-theme-lg hover:-translate-y-1 transition-all duration-300 dark:bg-navy-800 dark:border-navy-700">
      {/* Top Header Section */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-[14px] bg-[#8B1A1A] text-white font-bold text-xl shrink-0">
          {index}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-success-500' : 'bg-gray-400'}`}
            ></span>
            <span
              className={`text-[11px] font-bold tracking-wider ${status === 'ACTIVE' ? 'text-success-600 dark:text-success-500' : 'text-gray-500'} uppercase`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Stats Section */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-auto ml-16">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest shrink-0">
            Blogs
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">
            {blogsCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest shrink-0">
            Events
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">
            {eventsCount}
          </p>
        </div>
      </div>
    </div>
  );
};
