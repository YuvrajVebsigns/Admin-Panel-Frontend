import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  Nomination,
  NominationCategory,
  NominationSubCategory,
  NominationQueryParams,
  NominationCategoryQueryParams,
  NominationSubCategoryQueryParams,
  CreateNominationDto,
  UpdateNominationStatusDto,
  CreateNominationCategoryDto,
  UpdateNominationCategoryDto,
  GroupedNominator,
  GroupedNominee,
  WebsiteNominationStatusPayload,
  WebsiteNominationStatusResponse,
} from '@/modules/nominations/types/nomination.types';

export const nominationService = {
  // --- Nominations ---

  getNominations: async (
    params: NominationQueryParams = {},
  ): Promise<PaginatedResponse<Nomination>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.websiteId) queryParams.append('websiteId', params.websiteId);
    if (params.nominatorEmail) queryParams.append('nominatorEmail', params.nominatorEmail);
    if (params.nominatorId) queryParams.append('nominatorId', params.nominatorId);

    return apiFetch<PaginatedResponse<Nomination>>(`/admin/nominations?${queryParams.toString()}`);
  },

  getGroupedNominators: async (
    params: NominationQueryParams = {},
  ): Promise<PaginatedResponse<GroupedNominator>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.websiteId) queryParams.append('websiteId', params.websiteId);

    return apiFetch<PaginatedResponse<GroupedNominator>>(
      `/admin/nominations/grouped/nominators?${queryParams.toString()}`,
    );
  },

  getGroupedNominees: async (
    params: NominationQueryParams = {},
  ): Promise<PaginatedResponse<GroupedNominee>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.websiteId) queryParams.append('websiteId', params.websiteId);

    return apiFetch<PaginatedResponse<GroupedNominee>>(
      `/admin/nominations/grouped/nominees?${queryParams.toString()}`,
    );
  },

  getNomination: async (id: string): Promise<Nomination> => {
    return apiFetch<Nomination>(`/admin/nominations/${id}`);
  },

  createNomination: async (data: CreateNominationDto): Promise<Nomination> => {
    return apiFetch<Nomination>('/admin/nominations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateNominationStatus: async (
    id: string,
    data: UpdateNominationStatusDto,
  ): Promise<Nomination> => {
    return apiFetch<Nomination>(`/admin/nominations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateWebsiteNominationStatus: async (
    websiteId: string,
    data: WebsiteNominationStatusPayload,
  ): Promise<WebsiteNominationStatusResponse> => {
    return apiFetch<WebsiteNominationStatusResponse>(
      `/admin/nominations/websites/${websiteId}/nomination-status`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  },

  deleteNomination: async (id: string): Promise<void> => {
    return apiFetch<void>(`/admin/nominations/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Nomination Categories ---

  getCategories: async (
    params: NominationCategoryQueryParams = {},
  ): Promise<PaginatedResponse<NominationCategory>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    return apiFetch<PaginatedResponse<NominationCategory>>(
      `/admin/nomination-categories?${queryParams.toString()}`,
    );
  },

  getCategory: async (id: string): Promise<NominationCategory> => {
    return apiFetch<NominationCategory>(`/admin/nomination-categories/${id}`);
  },

  getSubCategories: async (
    params: NominationSubCategoryQueryParams = {},
  ): Promise<PaginatedResponse<NominationSubCategory>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);

    return apiFetch<PaginatedResponse<NominationSubCategory>>(
      `/admin/nomination-sub-categories?${queryParams.toString()}`,
    );
  },

  getSubCategory: async (id: string): Promise<NominationSubCategory> => {
    return apiFetch<NominationSubCategory>(`/admin/nomination-sub-categories/${id}`);
  },

  createCategory: async (data: CreateNominationCategoryDto): Promise<NominationCategory> => {
    return apiFetch<NominationCategory>('/admin/nomination-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory: async (
    id: string,
    data: UpdateNominationCategoryDto,
  ): Promise<NominationCategory> => {
    return apiFetch<NominationCategory>(`/admin/nomination-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: async (id: string): Promise<void> => {
    return apiFetch<void>(`/admin/nomination-categories/${id}`, {
      method: 'DELETE',
    });
  },
};
