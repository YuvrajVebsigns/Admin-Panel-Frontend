import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { nominationService } from '@/services/nomination.service';
import { PaginatedResponse } from '@/types/api.types';
import {
  NominationCategoryQueryParams,
  NominationCategory,
  NominationSubCategory,
  NominationSubCategoryQueryParams,
  CreateNominationCategoryDto,
  UpdateNominationCategoryDto,
} from '../types/nomination.types';
import toast from 'react-hot-toast';

export const useNominationCategories = (params: NominationCategoryQueryParams = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<
    PaginatedResponse<NominationCategory>,
    Error
  >({
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

export const useNominationSubCategories = (params: NominationSubCategoryQueryParams = {}) => {
  return useQuery<PaginatedResponse<NominationSubCategory>, Error>({
    queryKey: ['nominationSubCategories', params],
    queryFn: () => nominationService.getSubCategories(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useNominationSubCategory = (id: string) => {
  return useQuery<NominationSubCategory, Error>({
    queryKey: ['nominationSubCategory', id],
    queryFn: () => nominationService.getSubCategory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useNominationSubCategoriesByIds = (ids: string[]) => {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['nominationSubCategory', id],
      queryFn: () => nominationService.getSubCategory(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const subCategories = queries
    .map((query) => query.data)
    .filter((item): item is NominationSubCategory => Boolean(item));
  const isLoading = queries.some((query) => query.isLoading);
  const error = queries.find((query) => query.error)?.error;

  return { subCategories, isLoading, error };
};

export const useNominationCategoriesByIds = (ids: string[]) => {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['nominationCategory', id],
      queryFn: () => nominationService.getCategory(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const categories = queries
    .map((query) => query.data)
    .filter((item): item is NominationCategory => Boolean(item));
  const isLoading = queries.some((query) => query.isLoading);
  const error = queries.find((query) => query.error)?.error;

  return { categories, isLoading, error };
};

export const useNominationCategory = (id: string) => {
  return useQuery<NominationCategory, Error>({
    queryKey: ['nominationCategory', id],
    queryFn: () => nominationService.getCategory(id),
    enabled: !!id,
  });
};
