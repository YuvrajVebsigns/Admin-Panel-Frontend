import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import { PaginatedResponse } from '@/types/api.types';
import { Subscribe, SubscribeQueryParams } from '@/modules/subscribes/types/subscribe.types';

export const subscribeService = {
  getSubscribes: async (
    params: SubscribeQueryParams = {},
  ): Promise<PaginatedResponse<Subscribe>> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const filters = {
      ...(params.filters || {}),
      ...(params.search ? { email: params.search } : {}),
    };

    if (Object.keys(filters).length) {
      queryParams.append('filters', JSON.stringify(filters));
    }

    return apiFetch<PaginatedResponse<Subscribe>>(
      `${API_ENDPOINTS.ADMIN.SUBSCRIBES}?${queryParams.toString()}`,
    );
  },
};
