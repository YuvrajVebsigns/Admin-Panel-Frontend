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

      return {
        name: menu.name,
        icon: menu.icon,
        path: fullPath,
        subItems:
          menu.children && menu.children.length > 0
            ? menu.children.map((child) => mapMenuItem(child, fullPath))
            : undefined,
      };
    };

    sidebarMenus.forEach((menu: SidebarMenuItemResponse) => {
      const groupName = menu.group || 'MENU';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(mapMenuItem(menu));
    });

    return Object.entries(groups).map(([groupName, items]) => ({
      groupName,
      items,
    }));
  }, [sidebarMenus]);

  return { navGroups, isLoading };
}
