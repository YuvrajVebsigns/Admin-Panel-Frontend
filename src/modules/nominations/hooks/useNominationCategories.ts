import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nominationService } from '@/services/nomination.service';
import {
  NominationCategoryQueryParams,
  CreateNominationCategoryDto,
  UpdateNominationCategoryDto,
} from '../types/nomination.types';
import toast from 'react-hot-toast';

export const useNominationCategories = (params: NominationCategoryQueryParams = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['nominationCategories', params],
    queryFn: () => nominationService.getCategories(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateNominationCategoryDto) => nominationService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominationCategories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNominationCategoryDto }) =>
      nominationService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominationCategories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => nominationService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominationCategories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });

  return {
    categories: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useNominationCategory = (id: string) => {
  return useQuery({
    queryKey: ['nominationCategory', id],
    queryFn: () => nominationService.getCategory(id),
    enabled: !!id,
  });
};
