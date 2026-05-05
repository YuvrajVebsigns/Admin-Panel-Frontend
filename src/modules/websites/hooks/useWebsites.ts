import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { websitesService } from '@/services/websites.service';
import { WebsiteQueryParams, Website } from '../types/website.types';
import toast from 'react-hot-toast';

export const useWebsites = (params: WebsiteQueryParams = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['websites', params],
    queryFn: () => websitesService.getWebsites(params),
  });

  const createWebsiteMutation = useMutation({
    mutationFn: (data: Partial<Website>) => websitesService.createWebsite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create website');
    },
  });

  const updateWebsiteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Website> }) =>
      websitesService.updateWebsite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update website');
    },
  });

  const deleteWebsiteMutation = useMutation({
    mutationFn: (id: string) => websitesService.deleteWebsite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      toast.success('Website deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete website');
    },
  });

  return {
    websites: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    createWebsite: createWebsiteMutation.mutateAsync,
    isCreating: createWebsiteMutation.isPending,
    updateWebsite: updateWebsiteMutation.mutateAsync,
    isUpdating: updateWebsiteMutation.isPending,
    deleteWebsite: deleteWebsiteMutation.mutateAsync,
    isDeleting: deleteWebsiteMutation.isPending,
  };
};

export const useWebsite = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['website', id],
    queryFn: () => websitesService.getWebsite(id),
    enabled: !!id,
  });

  return {
    website: data,
    isLoading,
    error,
  };
};
