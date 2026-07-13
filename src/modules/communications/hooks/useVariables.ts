import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '@/services/communication.service';
import {
  VariableQueryParams,
  CreateVariableDto,
  UpdateVariableDto,
} from '../types/communication.types';

export const useFetchVariables = (params: VariableQueryParams = {}) => {
  return useQuery({
    queryKey: ['communication-variables', params],
    queryFn: () => communicationService.getVariables(params),
  });
};

export const useCreateVariable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVariableDto) => communicationService.createVariable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-variables'] });
    },
  });
};

export const useUpdateVariable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVariableDto }) =>
      communicationService.updateVariable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-variables'] });
    },
  });
};

export const useDeleteVariable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationService.deleteVariable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-variables'] });
    },
  });
};

export const useFetchRawMongooseSchema = () => {
  return useQuery({
    queryKey: ['raw-mongoose-schema'],
    queryFn: () => communicationService.getRawMongooseSchema(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};
