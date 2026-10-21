'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, MoreHorizontal, X } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useNavigation, NavItem } from '@/hooks/useNavigation';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import SidebarUserProfile from './SidebarUserProfile';
import SidebarSkeleton from './SidebarSkeleton';

export default function AppSidebar() {
  const { isExpanded, isMobile, isMobileOpen, isHovered, setIsHovered, closeMobileSidebar } =
    useSidebar();
  const pathname = usePathname();
  const { navGroups, isLoading } = useNavigation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLElement>(null);
  const showText = isExpanded || isHovered || isMobileOpen;

  useEffect(() => {
    if (!isMobileOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const wasLocked = document.body.classList.contains('overflow-hidden');
    document.body.classList.add('overflow-hidden');
    sidebarRef.current?.querySelector<HTMLButtonElement>('[data-close-navigation]')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileSidebar();
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]',
        ) ?? [],
      ).filter((element) => !element.closest('[inert]') && element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (!wasLocked) document.body.classList.remove('overflow-hidden');
      requestAnimationFrame(() => {
        if (previouslyFocused?.isConnected) previouslyFocused.focus();
        else document.getElementById('sidebar-toggle')?.focus();
      });
    };
  }, [isMobileOpen, closeMobileSidebar]);

  const isActive = (path?: string): boolean =>
    !!path &&
    (path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`));
  const hasActiveChild = (item: NavItem): boolean =>
    isActive(item.path) || !!item.subItems?.some(hasActiveChild);

  const renderItem = (item: NavItem, parentKey: string, depth = 0): React.ReactNode => {
    const key = `${parentKey}-${item.name}`;
    const children = item.subItems?.length ? item.subItems : undefined;
    const active = children ? hasActiveChild(item) : isActive(item.path);
    const open = openSubmenus[key] ?? active;
    const submenuId = `nav-${encodeURIComponent(key)}`;
    const classes = `${depth === 0 ? 'sidebar-menu-item' : 'sidebar-menu-dropdown-item'} group min-h-11 ${active ? (depth === 0 ? 'sidebar-menu-item-active' : 'sidebar-menu-dropdown-item-active') : 'sidebar-menu-item-inactive'} ${!showText ? 'justify-center' : ''}`;
    const content = (
      <>
        <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
          <DynamicIcon name={item.icon || 'LayoutGrid'} size={depth === 0 ? 20 : 16} />
        </span>
        {showText && <span className="min-w-0 flex-1 text-left leading-5">{item.name}</span>}
        {showText && children && (
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`shrink-0 motion-safe:transition-transform motion-safe:duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
        {showText && (item.new || item.pro) && (
          <span className="rounded bg-navy-100 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-600 dark:bg-navy-700 dark:text-navy-200">
            {item.new ? 'New' : 'Pro'}
          </span>
        )}
      </>
    );
    return (
      <li key={key}>
        {children ? (
          <button
            type="button"
            aria-label={item.name}
            title={!showText ? item.name : undefined}
            aria-expanded={showText && open}
            aria-controls={submenuId}
            className={classes}
            onClick={() => setOpenSubmenus((previous) => ({ ...previous, [key]: !open }))}
          >
            {content}
          </button>
        ) : item.path ? (
          <Link
            href={item.path}
            aria-label={item.name}
            title={!showText ? item.name : undefined}
            aria-current={active ? 'page' : undefined}
            className={classes}
            onClick={closeMobileSidebar}
          >
            {content}
          </Link>
        ) : null}
        {children && (
          <div
            id={submenuId}
            inert={!showText || !open}
            aria-hidden={!showText || !open}
            data-open={showText && open}
            className="admin-nav-submenu"
          >
            <div className="min-h-0 overflow-hidden">
              <ul
                className={`my-1 ml-5 space-y-1 border-l pl-3 ${active ? 'border-brand-200 dark:border-brand-500/30' : 'border-navy-100 dark:border-navy-700'}`}
              >
                {children.map((child) => renderItem(child, key, depth + 1))}
              </ul>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <aside
      ref={sidebarRef}
      id="app-sidebar"
      role={isMobileOpen ? 'dialog' : undefined}
      aria-modal={isMobileOpen ? true : undefined}
      aria-label="Main navigation"
      inert={isMobile && !isMobileOpen}
      className={`fixed inset-y-0 left-0 z-[60] flex h-dvh flex-col border-r border-navy-100 bg-white text-navy-800 motion-safe:transition-[width,transform] motion-safe:duration-200 dark:border-navy-800 dark:bg-navy-900 dark:text-navy-100 ${showText ? 'w-[290px]' : 'w-[90px]'} max-w-[calc(100vw-2rem)] ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && !isMobile && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => !isExpanded && !isMobile && setIsHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsHovered(false);
      }}
    >
      <div className="flex h-20 shrink-0 items-center justify-between gap-2 border-b border-navy-100 px-5 dark:border-navy-800">
        <Link
          href="/"
          aria-label="Core Media home"
          onClick={closeMobileSidebar}
          className="flex flex-1 items-center justify-center"
        >
          {showText ? (
            <>
              <Image
                className="h-auto w-[180px] object-contain dark:hidden"
                src="/images/logo/logo.webp"
                alt="Core Media"
                width={250}
                height={100}
                priority
              />
              <Image
                className="hidden h-auto w-[180px] object-contain dark:block"
                src="/images/logo/logo-dark.webp"
                alt="Core Media"
                width={250}
                height={100}
                priority
              />
            </>
          ) : (
            <Image
              className="size-10 object-contain"
              src="/images/logo/logo-icon.png"
              alt="Core Media"
              width={40}
              height={40}
            />
          )}
        </Link>
        <button
          data-close-navigation
          type="button"
          onClick={closeMobileSidebar}
          aria-label="Close navigation"
          className="admin-action flex size-11 shrink-0 items-center justify-center rounded-lg text-navy-500 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-800 lg:hidden"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <nav
        aria-label="Workspace"
        aria-busy={isLoading}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 custom-scrollbar"
      >
        {isLoading ? (
          <SidebarSkeleton />
        ) : navGroups.length ? (
          <div className="space-y-7">
            {navGroups.map((group) => (
              <div key={group.groupName}>
                <h2 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-navy-400 dark:text-navy-300">
                  {showText ? (
                    group.groupName
                  ) : (
                    <>
                      <MoreHorizontal size={18} aria-hidden="true" />
                      <span className="sr-only">{group.groupName}</span>
                    </>
                  )}
                </h2>
                <ul className="space-y-1">
                  {group.items.map((item) => renderItem(item, group.groupName))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-3 text-sm text-navy-500 dark:text-navy-300">
            {showText ? (
              'No navigation available for this account.'
            ) : (
              <span className="sr-only">No navigation available for this account.</span>
            )}
          </p>
        )}
      </nav>
      <div className="shrink-0">
        <SidebarUserProfile />
      </div>
    </aside>
  );
}
