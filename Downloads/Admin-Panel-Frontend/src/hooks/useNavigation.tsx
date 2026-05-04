'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, MenuItemResponse } from '@/services/admin.service';
import * as Icons from '@/icons';

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
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

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ElementType | undefined;
    return IconComponent ? <IconComponent /> : <Icons.GridIcon />;
  };

  const navGroups = useMemo(() => {
    if (!menus.length) return [];

    // Group the flat menu list by their group name
    const groups: Record<string, NavItem[]> = {};

    menus.forEach((menu: MenuItemResponse) => {
      const groupName = menu.group || 'MENU';
      if (!groups[groupName]) groups[groupName] = [];

      // Map API response to NavItem structure
      const navItem: NavItem = {
        name: menu.name,
        icon: getIcon(menu.icon),
        path: menu.path,
        subItems: menu.children?.map((child) => ({
          name: child.name,
          path: child.path,
        })),
      };

      groups[groupName].push(navItem);
    });

    return Object.entries(groups).map(([groupName, items]) => ({
      groupName,
      items,
    }));
  }, [menus]);

  return { navGroups, isLoading };
}
