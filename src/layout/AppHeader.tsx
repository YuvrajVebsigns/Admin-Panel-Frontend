'use client';

import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { Menu, Moon, Search, Sun, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function AppHeader() {
  const { isExpanded, isMobile, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { toggleTheme } = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-3 border-b border-navy-100 bg-white px-4 shadow-theme-xs dark:border-navy-800 dark:bg-navy-900 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          id="sidebar-toggle"
          type="button"
          onClick={() => (isMobile ? toggleMobileSidebar() : toggleSidebar())}
          aria-label={
            isMobile ? 'Open navigation' : isExpanded ? 'Collapse navigation' : 'Expand navigation'
          }
          aria-controls="app-sidebar"
          aria-expanded={isMobile ? isMobileOpen : isExpanded}
          className="admin-action flex size-11 shrink-0 items-center justify-center rounded-lg border border-navy-100 text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-800 dark:hover:text-white"
        >
          <Menu size={20} aria-hidden="true" className="lg:hidden" />
          {isExpanded ? (
            <PanelLeftClose size={20} aria-hidden="true" className="hidden lg:block" />
          ) : (
            <PanelLeftOpen size={20} aria-hidden="true" className="hidden lg:block" />
          )}
        </button>
        <Link href="/" aria-label="Core Media home" className="flex min-w-0 items-center lg:hidden">
          <Image
            width={200}
            height={80}
            className="h-10 w-32 object-contain dark:hidden"
            src="/images/logo/logo.svg"
            alt="Core Media"
            priority
          />
          <Image
            width={200}
            height={80}
            className="hidden h-10 w-32 object-contain dark:block"
            src="/images/logo/logo-dark.svg"
            alt="Core Media"
            priority
          />
        </Link>
        <div className="hidden border-l-2 border-brand-500 pl-3 sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-navy-400">
            Core Media
          </p>
          <p className="font-roboto text-sm font-medium text-navy-800 dark:text-navy-100">
            Administration workspace
          </p>
        </div>
        <div className="relative hidden min-w-0 lg:block lg:w-72 xl:w-96">
          <Search
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"
          />
          <input
            ref={searchRef}
            type="search"
            aria-label="Search or type a command"
            placeholder="Search or type a command…"
            className="h-11 w-full rounded-lg border border-navy-100 bg-navy-25 pl-10 pr-14 text-sm text-navy-800 placeholder:text-navy-400 focus:border-brand-500 focus:bg-white focus:ring-3 focus:ring-brand-500/10 dark:border-navy-700 dark:bg-navy-800 dark:text-white dark:placeholder:text-navy-300 dark:focus:bg-navy-900"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-navy-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-navy-400 dark:border-navy-700 dark:bg-navy-900">
            ⌘ K
          </kbd>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden border-r border-navy-100 pr-4 text-xs text-navy-500 dark:border-navy-700 dark:text-navy-300 md:block">
          Content and operations
        </span>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle light and dark theme"
          title="Toggle light and dark theme"
          className="admin-action flex size-11 items-center justify-center rounded-lg border border-navy-100 text-navy-500 transition-colors hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-800"
        >
          <Moon size={19} aria-hidden="true" className="dark:hidden" />
          <Sun size={19} aria-hidden="true" className="hidden dark:block" />
        </button>
      </div>
    </header>
  );
}
