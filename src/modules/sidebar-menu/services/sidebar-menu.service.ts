import { apiFetch } from '@/services/apiFetch';
import {
  SidebarMenu,
  CreateSidebarMenuDto,
  UpdateSidebarMenuDto,
  SidebarMenuReorderDto,
} from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { PaginatedResponse } from '@/types/api.types';

export const sidebarMenuService = {
  getSidebarMenus: () => apiFetch<SidebarMenu[]>('/admin/sidebar-menu'),

  getAllSidebarMenus: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    return apiFetch<PaginatedResponse<SidebarMenu>>(`/admin/sidebar-menu/all?${query.toString()}`);
  },

  createSidebarMenu: (data: CreateSidebarMenuDto) =>
    apiFetch<SidebarMenu>('/admin/sidebar-menu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSidebarMenu: (id: string, data: UpdateSidebarMenuDto) =>
    apiFetch<SidebarMenu>(`/admin/sidebar-menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteSidebarMenu: (id: string) =>
    apiFetch<void>(`/admin/sidebar-menu/${id}`, {
      method: 'DELETE',
    }),

  reorderSidebarMenus: (items: SidebarMenuReorderDto[]) =>
    apiFetch<void>('/admin/sidebar-menu/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
};
