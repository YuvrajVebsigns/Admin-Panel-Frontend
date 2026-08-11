import { apiFetch } from '@/services/apiFetch';
import { CxoNetworkMember } from '@/modules/websites/types/cms.types';

export interface QueryCxoNetworkParams {
  page?: number;
  limit?: number;
  search?: string;
  websiteId?: string;
  companyCategory?: string;
}

export interface PaginatedCxoNetworkResponse {
  data: CxoNetworkMember[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const cxoNetworkService = {
  getCxoNetworkMembers: async (
    params?: QueryCxoNetworkParams,
  ): Promise<PaginatedCxoNetworkResponse> => {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.websiteId) searchParams.append('websiteId', params.websiteId);
      if (params.companyCategory) searchParams.append('companyCategory', params.companyCategory);
    }
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiFetch<PaginatedCxoNetworkResponse>(`/admin/cxo-network${queryStr}`);
  },

  deleteCxoNetworkMember: async (id: string): Promise<void> => {
    return apiFetch<void>(`/admin/cxo-network/${id}`, {
      method: 'DELETE',
    });
  },
};
