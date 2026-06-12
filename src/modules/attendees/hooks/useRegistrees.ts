import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registreeService } from '@/services/registree.service';
import { RegistreeQueryParams, UpdateRegistreeInput } from '../types/registree.types';

export const useRegistrees = (params?: RegistreeQueryParams) => {
  return useQuery({
    queryKey: ['registrees', params],
    queryFn: () => registreeService.getRegistrees(params),
  });
};

export const useRegistree = (id: string) => {
  return useQuery({
    queryKey: ['registree', id],
    queryFn: () => registreeService.getRegistreeById(id),
    enabled: !!id,
  });
};

export const useUpdateRegistree = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRegistreeInput }) =>
      registreeService.updateRegistree(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrees'] });
      queryClient.invalidateQueries({ queryKey: ['registree', variables.id] });
    },
  });
};

export const useDeleteRegistree = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => registreeService.deleteRegistree(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrees'] });
    },
  });
};

export const useApproveRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, eventId }: { id: string; eventId: string }) =>
      registreeService.approveRegistration(id, eventId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrees'] });
      queryClient.invalidateQueries({ queryKey: ['registree', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
    },
  });
};

export const useRejectRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, eventId }: { id: string; eventId: string }) =>
      registreeService.rejectRegistration(id, eventId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrees'] });
      queryClient.invalidateQueries({ queryKey: ['registree', variables.id] });
    },
  });
};

export const useBlockRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, eventId }: { id: string; eventId: string }) =>
      registreeService.blockRegistration(id, eventId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrees'] });
      queryClient.invalidateQueries({ queryKey: ['registree', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
    },
  });
};
