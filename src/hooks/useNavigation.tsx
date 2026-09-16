'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, SidebarMenuItemResponse } from '@/services/admin.service';

export type NavItem = {
  name: string;
  icon?: string;
  path?: string;
  subItems?: NavItem[];
  pro?: boolean;
  new?: boolean;
};

export type NavGroup = {
  groupName: string;
  items: NavItem[];
};

export function useNavigation() {
  const { data: sidebarMenus = [], isLoading } = useQuery({
    queryKey: ['admin-sidebarMenus'],
    queryFn: () => adminService.getSidebarMenus(),
  });

  const navGroups = useMemo(() => {
    if (!sidebarMenus.length) return [];

    const groups: Record<string, NavItem[]> = {};

    const mapMenuItem = (menu: SidebarMenuItemResponse, parentPath: string = ''): NavItem => {
      // Clean paths: remove trailing slash from parent, ensure leading slash for menu
      const pPath = parentPath.replace(/\/+$/, '');
      const cPath = menu.path.startsWith('/') ? menu.path : `/${menu.path}`;
      const fullPath = `${pPath}${cPath}`;

      // Sort children by order key
      const sortedChildren = menu.children
        ? [...menu.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [];

      return {
        name: menu.name,
        icon: menu.icon,
        path: fullPath,
        subItems:
          sortedChildren.length > 0
            ? sortedChildren.map((child) => mapMenuItem(child, fullPath))
            : undefined,
      };
    };

    // Sort root level menus by order key
    const sortedRootMenus = [...sidebarMenus].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    sortedRootMenus.forEach((menu: SidebarMenuItemResponse) => {
      const groupName = menu.group || 'MENU';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(mapMenuItem(menu));
    });

    // Add fallback Subscribes and Nomination Categories menu items if the backend menu data does not include them.
    Object.values(groups).forEach((items) => {
      const contactIndex = items.findIndex((item) => item.path === '/contacts');
      const hasSubscribes = items.some((item) => item.path === '/subscribes');

      if (contactIndex !== -1 && !hasSubscribes) {
        items.splice(contactIndex + 1, 0, {
          name: 'Subscribes',
          icon: 'Mail',
          path: '/subscribes',
        });
      }

      const nominatorIndex = items.findIndex(
        (item) => item.path === '/nominators' || item.path === '/nominees',
      );
      const hasCategories = items.some((item) => item.path === '/nomination-categories');

      if (nominatorIndex !== -1 && !hasCategories) {
        const nomineeIndex = items.findIndex((item) => item.path === '/nominees');
        const insertIdx = nomineeIndex !== -1 ? nomineeIndex + 1 : nominatorIndex + 1;
        items.splice(insertIdx, 0, {
          name: 'Nomination Categories',
          icon: 'Layers',
          path: '/nomination-categories',
        });
      }
    });

    return Object.entries(groups).map(([groupName, items]) => ({
      groupName,
      items,
    }));
  }, [sidebarMenus]);

  return { navGroups, isLoading };
}
