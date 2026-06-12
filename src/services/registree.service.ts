import { apiFetch } from '@/services/apiFetch';
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
};
