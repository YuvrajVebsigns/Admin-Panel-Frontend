import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';

export interface MenuItemResponse {
  id: string;
  name: string;
  path: string;
  icon: string;
  permissionKey: string;
  order: number;
  group?: string;
  parentId?: string;
  children?: MenuItemResponse[];
}

export const adminService = {
  getMenus: async (): Promise<MenuItemResponse[]> => {
    return apiFetch<MenuItemResponse[]>(API_ENDPOINTS.ADMIN.MENUS);
  },
};
