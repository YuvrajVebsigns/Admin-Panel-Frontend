'use client';

import React from 'react';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import Backdrop from '@/layout/Backdrop';
import { useSidebar } from '@/context/SidebarContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered } = useSidebar();

  return (
    <div className="flex min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      <Backdrop />
      <div
        className={`relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        }`}
      >
        <AppHeader />
        <main>
          <div className="p-4 md:p-6 2xl:p-10 w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
