'use client';

import React from 'react';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import Backdrop from '@/layout/Backdrop';
import { useSidebar } from '@/context/SidebarContext';
import SecurityProvider from '@/providers/SecurityProvider';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <SecurityProvider>
      <div className="admin-workspace flex min-h-dvh bg-navy-25 dark:bg-navy-950">
        <AppSidebar />
        <Backdrop />
        <div
          inert={isMobileOpen}
          className={`relative flex min-w-0 flex-1 flex-col motion-safe:transition-[margin] motion-safe:duration-200 ${
            isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
          }`}
        >
          <a
            href="#main-content"
            className="sr-only z-40 rounded-lg bg-brand-500 px-4 py-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <AppHeader />
          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
            <div
              key={pathname}
              className={`${pathname === '/' ? '' : 'admin-page-enter'} mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:px-10`}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </SecurityProvider>
  );
}
