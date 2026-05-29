import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sponsorService } from '@/services/sponsor.service';
import { SponsorQueryParams, CreateSponsorDto, UpdateSponsorDto } from '../types/sponsor.types';
import toast from 'react-hot-toast';

export const useSponsors = (params: SponsorQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: sponsorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sponsors', params],
    queryFn: () => sponsorService.getSponsors(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSponsorDto) => sponsorService.createSponsor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast.success('Sponsor created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create sponsor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSponsorDto }) =>
      sponsorService.updateSponsor(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['sponsor', variables.id] });
      toast.success('Sponsor updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update sponsor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sponsorService.deleteSponsor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      toast.success('Sponsor deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete sponsor');
    },
  });

  return {
    sponsors: sponsorsData?.data || [],
    meta: sponsorsData?.meta,
    isLoading,
    error,
    createSponsor: createMutation.mutateAsync,
    updateSponsor: updateMutation.mutateAsync,
    deleteSponsor: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useSponsor = (id: string) => {
  return useQuery({
    queryKey: ['sponsor', id],
    queryFn: () => sponsorService.getSponsor(id),
    enabled: !!id,
  });
};
