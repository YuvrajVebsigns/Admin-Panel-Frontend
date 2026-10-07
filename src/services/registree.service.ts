import { apiFetch, apiFetchBlob, triggerFileDownload } from '@/services/apiFetch';
import {
  Registree,
  RegistreeQueryParams,
  UpdateRegistreeInput,
  PaginatedRegistreesResponse,
} from '@/modules/attendees/types/registree.types';

export const registreeService = {
  getRegistrees: async (params?: RegistreeQueryParams): Promise<PaginatedRegistreesResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.email) searchParams.append('email', params.email);
      if (params.eventId) searchParams.append('eventId', params.eventId);
      if (params.websiteId) searchParams.append('websiteId', params.websiteId);
      if (params.tag) searchParams.append('tag', params.tag);
      if (params.status) searchParams.append('status', params.status);
      if (params.eventOnly !== undefined)
        searchParams.append('eventOnly', params.eventOnly.toString());
    }
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiFetch<PaginatedRegistreesResponse>(`/admin/registrees${queryStr}`);
  },

  getRegistreeById: async (id: string): Promise<Registree> => {
    return apiFetch<Registree>(`/admin/registrees/${id}`);
  },

  updateRegistree: async (id: string, data: UpdateRegistreeInput): Promise<Registree> => {
    return apiFetch<Registree>(`/admin/registrees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteRegistree: async (id: string): Promise<void> => {
    return apiFetch<void>(`/admin/registrees/${id}`, {
      method: 'DELETE',
    });
  },

  approveRegistration: async (id: string, eventId: string): Promise<unknown> => {
    return apiFetch<unknown>(`/admin/registrees/${id}/registrations/${eventId}/approve`, {
      method: 'PATCH',
    });
  },

  rejectRegistration: async (id: string, eventId: string): Promise<unknown> => {
    return apiFetch<unknown>(`/admin/registrees/${id}/registrations/${eventId}/reject`, {
      method: 'PATCH',
    });
  },

  blockRegistration: async (id: string, eventId: string): Promise<unknown> => {
    return apiFetch<unknown>(`/admin/registrees/${id}/registrations/${eventId}/block`, {
      method: 'PATCH',
    });
  },

  downloadBulkTemplate: async (params: {
    websiteId: string;
    eventId: string;
    rows?: number;
  }): Promise<void> => {
    const searchParams = new URLSearchParams();
    searchParams.append('websiteId', params.websiteId);
    searchParams.append('eventId', params.eventId);
    if (params.rows) {
      searchParams.append('rows', params.rows.toString());
    }

    const blob = await apiFetchBlob(
      `/admin/registrees/bulk-upload/template?${searchParams.toString()}`,
    );
    const filename = `registration-bulk-template-${Date.now()}.xlsx`;
    triggerFileDownload(blob, filename);
  },

  processBulkUpload: async (payload: {
    rows: Array<{
      websiteName?: string;
      websiteId?: string;
      eventTitle?: string;
      eventId?: string;
      fullName: string;
      workEmail: string;
      personalEmail?: string;
      countryCode?: string;
      phoneNumber?: string;
      landlineNumber?: string;
      organization: string;
      jobTitle: string;
      industryVertical?: string;
      city?: string;
      state?: string;
      country?: string;
      registrationType?: string;
      sponsorConsent?: string | boolean;
      message?: string;
    }>;
    defaultWebsiteId?: string;
    defaultEventId?: string;
  }): Promise<{
    success: boolean;
    totalProcessed: number;
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    errors: Array<{ row: number; email?: string; error: string }>;
  }> => {
    return apiFetch(`/admin/registrees/bulk-upload/process`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
