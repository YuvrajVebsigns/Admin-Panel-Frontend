import React from 'react';

interface WebsiteStatusIndicatorProps {
  status: boolean[];
}

export const WebsiteStatusIndicator: React.FC<WebsiteStatusIndicatorProps> = ({ status }) => {
  return (
    <div className="flex items-center gap-1">
      {status.map((isActive, index) => (
        <div
          key={index}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
            isActive
              ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
              : 'bg-gray-200 text-gray-500 dark:bg-navy-700 dark:text-gray-400'
          }`}
        >
          {index + 1}
        </div>
      ))}
    </div>
  );
};
