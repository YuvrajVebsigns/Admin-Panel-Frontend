import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/services/blog.service';
import { BlogQueryParams, CreateBlogDto, UpdateBlogDto } from '../types/blog.types';
import toast from 'react-hot-toast';

export const useBlogs = (params: BlogQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: blogsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogService.getBlogs(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBlogDto) => blogService.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create blog');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogDto }) =>
      blogService.updateBlog(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
      toast.success('Blog updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update blog');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete blog');
    },
  });

  return {
    blogs: blogsData?.data || [],
    meta: blogsData?.meta,
    isLoading,
    error,
    createBlog: createMutation.mutateAsync,
    updateBlog: updateMutation.mutateAsync,
    deleteBlog: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useBlog = (id: string) => {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogService.getBlog(id),
    enabled: !!id,
  });
};
