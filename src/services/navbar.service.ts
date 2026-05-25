import { apiFetch } from '@/services/apiFetch';
import { NavbarItem } from '../modules/websites/types/cms.types';

export const navbarService = {
  getNavbarItems: async (params: {
    siteId: string;
    position?: string;
    nested?: boolean;
  }): Promise<NavbarItem[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('siteId', params.siteId);
    if (params.position) queryParams.append('position', params.position);
    if (params.nested !== undefined) queryParams.append('nested', params.nested.toString());

    return apiFetch<NavbarItem[]>(`/website/navbar?${queryParams.toString()}`);
  },

  getNavbarItemById: async (id: string): Promise<NavbarItem> => {
    return apiFetch<NavbarItem>(`/website/navbar/${id}`);
  },

  createNavbarItem: async (data: Partial<NavbarItem>): Promise<NavbarItem> => {
    return apiFetch<NavbarItem>('/website/navbar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateNavbarItem: async (id: string, data: Partial<NavbarItem>): Promise<NavbarItem> => {
    return apiFetch<NavbarItem>(`/website/navbar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteNavbarItem: async (id: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/website/navbar/${id}`, {
      method: 'DELETE',
    });
  },

  reorderNavbarItems: async (data: {
    siteId: string;
    position: string;
    orders: Array<{ id: string; order: number }>;
  }): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>('/website/navbar/reorder', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
