import { apiFetch } from '@/services/apiFetch';
import { QueryFileParams, FileResponse, FileData, UpdateFileData } from '../types/file.types';

export const fileService = {
  getFiles: async (params: QueryFileParams = {}): Promise<FileResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.module) queryParams.append('module', params.module);
    if (params.visibility) queryParams.append('visibility', params.visibility);
    if (params.fileType) queryParams.append('fileType', params.fileType);
    if (params.sort) queryParams.append('sort', params.sort);

    return apiFetch<FileResponse>(`/admin/files?${queryParams.toString()}`);
  },

  getFileUrl: async (id: string): Promise<{ url: string; variants: Record<string, string> }> => {
    return apiFetch<{ url: string; variants: Record<string, string> }>(`/admin/files/${id}/url`);
  },

  deleteFile: async (id: string): Promise<void> => {
    return apiFetch<void>(`/admin/files/${id}`, {
      method: 'DELETE',
    });
  },

  uploadFile: async (formData: FormData): Promise<FileData> => {
    return apiFetch<FileData>('/admin/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  updateFile: async (id: string, data: UpdateFileData): Promise<FileData> => {
    return apiFetch<FileData>(`/admin/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
