import { apiFetch } from '@/services/apiFetch';
import { PaginatedResponse } from '@/types/api.types';
import {
  Blog,
  BlogQueryParams,
  CreateBlogDto,
  UpdateBlogDto,
} from '../modules/blogs/types/blog.types';

export const blogService = {
  getBlogs: async (params: BlogQueryParams = {}): Promise<PaginatedResponse<Blog>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.websiteId) queryParams.append('websiteId', params.websiteId);

    return apiFetch<PaginatedResponse<Blog>>(`/admin/blogs?${queryParams.toString()}`);
  },

  getBlog: async (id: string) => {
    return apiFetch<Blog>(`/admin/blogs/${id}`);
  },

  createBlog: async (data: CreateBlogDto) => {
    return apiFetch<Blog>('/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBlog: async (id: string, data: UpdateBlogDto) => {
    return apiFetch<Blog>(`/admin/blogs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteBlog: async (id: string) => {
    return apiFetch<void>(`/admin/blogs/${id}`, {
      method: 'DELETE',
    });
  },
};
