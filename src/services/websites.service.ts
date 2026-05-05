import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import { Website, WebsiteQueryParams } from '../modules/websites/types/website.types';

export const websitesService = {
  getWebsites: async (params: WebsiteQueryParams = {}): Promise<PaginatedResponse<Website>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    return apiFetch<PaginatedResponse<Website>>(`/admin/websites?${queryParams.toString()}`);
  },

  getWebsite: async (id: string) => {
    return apiFetch<Website>(`/admin/websites/${id}`);
  },

  createWebsite: async (data: Partial<Website>) => {
    return apiFetch<Website>('/admin/websites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWebsite: async (id: string, data: Partial<Website>) => {
    return apiFetch<Website>(`/admin/websites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteWebsite: async (id: string) => {
    return apiFetch<void>(`/admin/websites/${id}`, {
      method: 'DELETE',
    });
  },
};
