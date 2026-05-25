import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import { WebsitePage, SeoMeta } from '../modules/websites/types/cms.types';

export const websitePageService = {
  getPages: async (params: {
    siteId: string;
    search?: string;
    status?: string;
    pageType?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WebsitePage>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('siteId', params.siteId);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.pageType) queryParams.append('pageType', params.pageType);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return apiFetch<PaginatedResponse<WebsitePage>>(`/website/pages?${queryParams.toString()}`);
  },

  getPageById: async (id: string): Promise<WebsitePage> => {
    const response = await apiFetch<{ success: boolean; data: WebsitePage }>(
      `/website/pages/id/${id}`,
    );
    return response.data;
  },

  createPage: async (data: Partial<WebsitePage>): Promise<WebsitePage> => {
    const response = await apiFetch<{ success: boolean; message: string; data: WebsitePage }>(
      '/website/pages',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return response.data;
  },

  updatePage: async (id: string, data: Partial<WebsitePage>): Promise<WebsitePage> => {
    const response = await apiFetch<{ success: boolean; message: string; data: WebsitePage }>(
      `/website/pages/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
    return response.data;
  },

  deletePage: async (id: string): Promise<void> => {
    await apiFetch<void>(`/website/pages/${id}`, {
      method: 'DELETE',
    });
  },

  publishPage: async (id: string): Promise<WebsitePage> => {
    const response = await apiFetch<{ success: boolean; message: string; data: WebsitePage }>(
      `/website/pages/${id}/publish`,
      {
        method: 'POST',
      },
    );
    return response.data;
  },

  unpublishPage: async (id: string): Promise<WebsitePage> => {
    const response = await apiFetch<{ success: boolean; message: string; data: WebsitePage }>(
      `/website/pages/${id}/unpublish`,
      {
        method: 'POST',
      },
    );
    return response.data;
  },

  duplicatePage: async (id: string): Promise<WebsitePage> => {
    const response = await apiFetch<{ success: boolean; message: string; data: WebsitePage }>(
      `/website/pages/${id}/duplicate`,
      {
        method: 'POST',
      },
    );
    return response.data;
  },

  updatePageSeo: async (id: string, seo: Partial<SeoMeta>): Promise<WebsitePage> => {
    const response = await apiFetch<{ success: boolean; message: string; data: WebsitePage }>(
      `/website/pages/${id}/seo`,
      {
        method: 'PATCH',
        body: JSON.stringify({ seo }),
      },
    );
    return response.data;
  },
};
