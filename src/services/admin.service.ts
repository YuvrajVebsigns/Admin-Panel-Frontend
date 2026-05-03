import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';

export interface SidebarMenuItemResponse {
  id: string;
  name: string;
  path: string;
  icon: string;
  permissionKey: string;
  order: number;
  group?: string;
  parentId?: string;
  children?: SidebarMenuItemResponse[];
}

export const adminService = {
  getSidebarMenus: async (): Promise<SidebarMenuItemResponse[]> => {
    return apiFetch<SidebarMenuItemResponse[]>(API_ENDPOINTS.ADMIN.MENUS);
  },
};
