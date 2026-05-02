import { apiFetch } from '@/services/apiFetch';
import { Menu, CreateMenuDto, UpdateMenuDto, MenuReorderDto } from '../types/menu.types';
import { PaginatedResponse } from '@/types/api.types';

export const menuService = {
  getMenus: () => apiFetch<Menu[]>('/admin/menus'),

  getAllMenus: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    return apiFetch<PaginatedResponse<Menu>>(`/admin/menus/all?${query.toString()}`);
  },

  createMenu: (data: CreateMenuDto) =>
    apiFetch<Menu>('/admin/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMenu: (id: string, data: UpdateMenuDto) =>
    apiFetch<Menu>(`/admin/menus/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMenu: (id: string) =>
    apiFetch<void>(`/admin/menus/${id}`, {
      method: 'DELETE',
    }),

  reorderMenus: (items: MenuReorderDto[]) =>
    apiFetch<void>('/admin/menus/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
};
