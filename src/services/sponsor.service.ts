import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  Sponsor,
  SponsorQueryParams,
  CreateSponsorDto,
  UpdateSponsorDto,
} from '../modules/sponsors/types/sponsor.types';

export const sponsorService = {
  getSponsors: async (params: SponsorQueryParams = {}): Promise<PaginatedResponse<Sponsor>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.tier) queryParams.append('tier', params.tier);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    return apiFetch<PaginatedResponse<Sponsor>>(`/admin/sponsors?${queryParams.toString()}`);
  },

  getSponsor: async (id: string) => {
    return apiFetch<Sponsor>(`/admin/sponsors/${id}`);
  },

  createSponsor: async (data: CreateSponsorDto) => {
    return apiFetch<Sponsor>('/admin/sponsors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSponsor: async (id: string, data: UpdateSponsorDto) => {
    return apiFetch<Sponsor>(`/admin/sponsors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteSponsor: async (id: string) => {
    return apiFetch<void>(`/admin/sponsors/${id}`, {
      method: 'DELETE',
    });
  },
};
