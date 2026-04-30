import React from 'react';
import { useSidebar } from '@/context/SidebarContext';

const SidebarSkeleton: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const showText = isExpanded || isHovered || isMobileOpen;

  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {[1, 2].map((group) => (
        <div key={group} className="flex flex-col gap-4">
          {/* Group Header */}
          <div
            className={`h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-12 ${!showText ? 'mx-auto' : ''}`}
          />

          {/* Menu Items */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`flex items-center gap-3 p-3 rounded-lg ${!showText ? 'justify-center' : ''}`}
            >
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
              {showText && <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-24" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SidebarSkeleton;
