import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import { Report, ReportDownloader } from '../modules/websites/types/cms.types';

export const reportService = {
  getReports: async (params: {
    websiteId?: string;
    search?: string;
    isPublished?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Report>> => {
    const queryParams = new URLSearchParams();
    if (params.websiteId) queryParams.append('websiteId', params.websiteId);
    if (params.search) queryParams.append('search', params.search);
    if (params.isPublished) queryParams.append('isPublished', params.isPublished);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return apiFetch<PaginatedResponse<Report>>(`/admin/website/reports?${queryParams.toString()}`);
  },

  getReportById: async (id: string): Promise<Report> => {
    return apiFetch<Report>(`/admin/website/reports/${id}`);
  },

  createReport: async (data: Partial<Report>): Promise<Report> => {
    return apiFetch<Report>('/admin/website/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateReport: async (id: string, data: Partial<Report>): Promise<Report> => {
    return apiFetch<Report>(`/admin/website/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteReport: async (id: string): Promise<void> => {
    await apiFetch<void>(`/admin/website/reports/${id}`, {
      method: 'DELETE',
    });
  },

  getReportDownloaders: async (id: string): Promise<ReportDownloader[]> => {
    return apiFetch<ReportDownloader[]>(`/admin/website/reports/${id}/downloaders`);
  },
};
