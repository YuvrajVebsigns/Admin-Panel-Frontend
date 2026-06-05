import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nominationService } from '@/services/nomination.service';
import {
  NominationQueryParams,
  CreateNominationDto,
  UpdateNominationStatusDto,
} from '../types/nomination.types';
import toast from 'react-hot-toast';

export const useNominations = (params: NominationQueryParams = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['nominations', params],
    queryFn: () => nominationService.getNominations(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateNominationDto) => nominationService.createNomination(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations'] });
      toast.success('Nomination created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create nomination');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNominationStatusDto }) =>
      nominationService.updateNominationStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nominations'] });
      queryClient.invalidateQueries({ queryKey: ['nomination', variables.id] });
      toast.success('Nomination status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update nomination status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => nominationService.deleteNomination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations'] });
      toast.success('Nomination deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete nomination');
    },
  });

  return {
    nominations: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    createNomination: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    deleteNomination: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useNomination = (id: string) => {
  return useQuery({
    queryKey: ['nomination', id],
    queryFn: () => nominationService.getNomination(id),
    enabled: !!id,
  });
};

export const useGroupedNominators = (params: NominationQueryParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['nominators', 'grouped', params],
    queryFn: () => nominationService.getGroupedNominators(params),
  });

  return {
    nominators: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
};

export const useGroupedNominees = (params: NominationQueryParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['nominees', 'grouped', params],
    queryFn: () => nominationService.getGroupedNominees(params),
  });

  return {
    nominees: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
};
