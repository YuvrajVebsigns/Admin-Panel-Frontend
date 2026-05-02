'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../context/SidebarContext';
import { ChevronDownIcon, HorizontaLDots } from '../icons/index';
import SidebarUserProfile from './SidebarUserProfile';
import SidebarSkeleton from './SidebarSkeleton';
import { useNavigation, NavItem } from '@/hooks/useNavigation';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { navGroups, isLoading } = useNavigation();
  const [mounted, setMounted] = useState(false);

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = useCallback(
    (path: string) => {
      if (!path) return false;
      if (path === '/') return pathname === '/';
      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname],
  );

  const isAnyChildActive = useCallback(
    (item: NavItem): boolean => {
      if (item.path && isActive(item.path)) return true;
      if (item.subItems) {
        return item.subItems.some((subItem) => isAnyChildActive(subItem));
      }
      return false;
    },
    [isActive],
  );

  useEffect(() => {
    const newOpenState: Record<string, boolean> = { ...openSubmenus };

    const checkAndOpen = (item: NavItem, parentPath: string) => {
      const itemKey = `${parentPath}-${item.name}`;
      if (item.subItems) {
        if (isAnyChildActive(item)) {
          newOpenState[itemKey] = true;
        }
        item.subItems.forEach((child) => checkAndOpen(child, itemKey));
      }
    };

    navGroups.forEach((group) => {
      group.items.forEach((item) => checkAndOpen(item, group.groupName));
    });

    // Only update if there are actual changes to prevent infinite loops
    setOpenSubmenus((prev) => {
      const changed = Object.keys(newOpenState).some((k) => newOpenState[k] !== prev[k]);
      return changed ? newOpenState : prev;
    });
  }, [pathname, navGroups, isAnyChildActive]);

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderIcon = (iconName: string | undefined, active: boolean, depth: number) => {
    const iconSize = depth === 0 ? 20 : 16;
    const containerSize = depth === 0 ? 'w-9 h-9' : 'w-7 h-7';

    return (
      <div
        className={`flex items-center justify-center shrink-0 ${containerSize} rounded-lg transition-all duration-200 
        ${
          active
            ? 'bg-brand-500/10 text-brand-500 shadow-sm'
            : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-hover:bg-gray-100 dark:group-hover:bg-white/10 dark:group-hover:text-gray-300'
        }`}
      >
        <DynamicIcon name={iconName || 'LayoutGrid'} size={iconSize} />
      </div>
    );
  };

  const renderItem = (nav: NavItem, parentPath: string, depth = 0) => {
    const itemKey = `${parentPath}-${nav.name}`;
    const isOpen = openSubmenus[itemKey];
    const hasChildren = nav.subItems && nav.subItems.length > 0;
    const active = hasChildren ? isAnyChildActive(nav) : nav.path ? isActive(nav.path) : false;

    if (depth === 0) {
      return (
        <li key={itemKey}>
          {hasChildren ? (
            <button
              onClick={() => toggleSubmenu(itemKey)}
              className={`menu-item group cursor-pointer w-full
                ${active ? 'menu-item-active' : 'menu-item-inactive'}
                ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}
                px-3 py-2.5
              `}
            >
              {renderIcon(nav.icon, active, depth)}
              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <span className="menu-item-text text-left">{nav.name}</span>
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-500' : ''}`}
                  />
                </>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${active ? 'menu-item-active' : 'menu-item-inactive'} ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'} px-3 py-2.5`}
              >
                {renderIcon(nav.icon, active, depth)}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {hasChildren && (isExpanded || isHovered || isMobileOpen) && (
            <div
              className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-col gap-1 ml-9 border-l border-gray-100 dark:border-gray-800">
                  {nav.subItems!.map((subItem) => renderItem(subItem, itemKey, depth + 1))}
                </ul>
              </div>
            </div>
          )}
        </li>
      );
    } else {
      return (
        <li key={itemKey} className="relative">
          {hasChildren ? (
            <button
              onClick={() => toggleSubmenu(itemKey)}
              className={`menu-dropdown-item w-full flex items-center justify-between group py-2
                ${active ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}
              `}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-3 border-t border-gray-200 dark:border-gray-700"></span>
                <div className="pl-3.5 flex items-center gap-2.5 truncate">
                  {renderIcon(nav.icon, active, depth)}
                  <span className="truncate">{nav.name}</span>
                </div>
              </div>
              <ChevronDownIcon
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-500' : ''}`}
              />
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-dropdown-item flex items-center justify-between group relative py-2
                ${active ? 'menu-dropdown-item-active' : 'menu-dropdown-item-inactive'}
              `}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-3 border-t border-gray-200 dark:border-gray-700"></span>
                  <div className="pl-3.5 flex items-center gap-2.5 truncate">
                    {renderIcon(nav.icon, active, depth)}
                    <span className="truncate">{nav.name}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 shrink-0 ml-2">
                  {nav.new && (
                    <span
                      className={`menu-dropdown-badge ${active ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'}`}
                    >
                      new
                    </span>
                  )}
                  {nav.pro && (
                    <span
                      className={`menu-dropdown-badge ${active ? 'menu-dropdown-badge-active' : 'menu-dropdown-badge-inactive'}`}
                    >
                      pro
                    </span>
                  )}
                </span>
              </Link>
            )
          )}

          {hasChildren && (
            <div
              className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <ul className="flex flex-col gap-1 border-l border-gray-100 dark:border-gray-800 ml-[23px] mt-1 mb-1 relative">
                  {/* Vertical line extension to connect deep children */}
                  <div className="absolute -top-1 -left-[1px] h-3 border-l border-gray-200 dark:border-gray-700"></div>
                  {nav.subItems!.map((subItem) => renderItem(subItem, itemKey, depth + 1))}
                </ul>
              </div>
            </div>
          )}
        </li>
      );
    }
  };

  const renderMenuItems = (items: NavItem[], menuType: string) => (
    <ul className="flex flex-col gap-4">{items.map((nav) => renderItem(nav, menuType, 0))}</ul>
  );

  if (!mounted) return null;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <SidebarSkeleton />
            ) : (
              navGroups.map((group) => (
                <div key={group.groupName}>
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? group.groupName : <HorizontaLDots />}
                  </h2>
                  {renderMenuItems(group.items, group.groupName)}
                </div>
              ))
            )}
          </div>
        </nav>
      </div>

      {/* User Profile Menu at the bottom */}
      <div className="mt-auto shrink-0">
        <SidebarUserProfile />
      </div>
    </aside>
  );
};

export default AppSidebar;
