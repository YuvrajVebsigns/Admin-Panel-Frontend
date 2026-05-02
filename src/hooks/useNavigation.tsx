'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, MenuItemResponse } from '@/services/admin.service';

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
  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['admin-menus'],
    queryFn: () => adminService.getMenus(),
  });

  const navGroups = useMemo(() => {
    if (!menus.length) return [];

    const groups: Record<string, NavItem[]> = {};

    const mapMenuItem = (menu: MenuItemResponse): NavItem => ({
      name: menu.name,
      icon: menu.icon,
      path: menu.path,
      subItems:
        menu.children && menu.children.length > 0 ? menu.children.map(mapMenuItem) : undefined,
    });

    menus.forEach((menu: MenuItemResponse) => {
      const groupName = menu.group || 'MENU';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(mapMenuItem(menu));
    });

    return Object.entries(groups).map(([groupName, items]) => ({
      groupName,
      items,
    }));
  }, [menus]);

  return { navGroups, isLoading };
}
