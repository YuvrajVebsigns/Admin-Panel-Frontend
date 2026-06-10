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

    return apiFetch<PaginatedResponse<WebsitePage>>(
      `/admin/website/pages?showMetaData=true&${queryParams.toString()}`,
    );
  },

  getPageById: async (id: string): Promise<WebsitePage> => {
    // apiFetch auto-unwraps { success, data } → returns the WebsitePage directly
    return apiFetch<WebsitePage>(`/admin/website/pages/id/${id}`);
  },

  createPage: async (data: Partial<WebsitePage>): Promise<WebsitePage> => {
    // apiFetch auto-unwraps { success, data } → returns the WebsitePage directly
    return apiFetch<WebsitePage>('/admin/website/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePage: async (id: string, data: Partial<WebsitePage>): Promise<WebsitePage> => {
    // apiFetch auto-unwraps { success, data } → returns the WebsitePage directly
    return apiFetch<WebsitePage>(`/admin/website/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deletePage: async (id: string): Promise<void> => {
    await apiFetch<void>(`/admin/website/pages/${id}`, {
      method: 'DELETE',
    });
  },

  publishPage: async (id: string): Promise<WebsitePage> => {
    return apiFetch<WebsitePage>(`/admin/website/pages/${id}/publish`, {
      method: 'POST',
    });
  },

  unpublishPage: async (id: string): Promise<WebsitePage> => {
    return apiFetch<WebsitePage>(`/admin/website/pages/${id}/unpublish`, {
      method: 'POST',
    });
  },

  duplicatePage: async (id: string): Promise<WebsitePage> => {
    return apiFetch<WebsitePage>(`/admin/website/pages/${id}/duplicate`, {
      method: 'POST',
    });
  },

  updatePageSeo: async (id: string, seo: Partial<SeoMeta>): Promise<WebsitePage> => {
    return apiFetch<WebsitePage>(`/admin/website/pages/${id}/seo`, {
      method: 'PATCH',
      body: JSON.stringify({ seo }),
    });
  },
};
