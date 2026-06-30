import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '@/services/communication.service';
import {
  CreateEventTemplateMappingDto,
  UpdateEventTemplateMappingDto,
} from '../types/communication.types';
import toast from 'react-hot-toast';

export const useEventMappings = () => {
  const queryClient = useQueryClient();

  const {
    data: mappings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['communication-event-mappings'],
    queryFn: () => communicationService.getEventMappings(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEventTemplateMappingDto) =>
      communicationService.createEventMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-event-mappings'] });
      toast.success('Event mapping created successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to create event mapping';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventTemplateMappingDto }) =>
      communicationService.updateEventMapping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-event-mappings'] });
      toast.success('Event mapping updated successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update event mapping';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => communicationService.deleteEventMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-event-mappings'] });
      toast.success('Event mapping deleted successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete event mapping';
      toast.error(message);
    },
  });

  return {
    mappings,
    isLoading,
    error,
    refetch,
    createMapping: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateMapping: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteMapping: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
