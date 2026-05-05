import { apiFetch } from './apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import { User as SystemUser } from '@/types/user.types';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
  sort?: string;
}

export const systemUsersService = {
  getUsers: async (params: UserQueryParams = {}): Promise<PaginatedResponse<SystemUser>> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query.append(key, value.toString());
      }
    });

    const response = await apiFetch<PaginatedResponse<SystemUser>>(
      `/admin/system-users?${query.toString()}`,
    );
    return response;
  },

  getUserById: async (id: string): Promise<SystemUser> => {
    const response = await apiFetch<SystemUser>(`/admin/system-users/${id}`);
    return response;
  },

  createUser: async (data: Record<string, unknown>): Promise<SystemUser> => {
    const response = await apiFetch<SystemUser>('/admin/system-users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  updateUser: async (id: string, data: Record<string, unknown>): Promise<SystemUser> => {
    const response = await apiFetch<SystemUser>(`/admin/system-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiFetch(`/admin/system-users/${id}`, {
      method: 'DELETE',
    });
  },
};
