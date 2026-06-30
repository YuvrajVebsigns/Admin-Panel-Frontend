import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '@/services/communication.service';
import { CommunicationLogQueryParams, SendMessageDto } from '../types/communication.types';
import toast from 'react-hot-toast';

export const useCommunicationLogs = (params: CommunicationLogQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['communication-logs', params],
    queryFn: () => communicationService.getLogs(params),
    refetchInterval: 8000, // Refetch logs list every 8 seconds for dynamic updates
  });

  const sendMutation = useMutation({
    mutationFn: (data: SendMessageDto) => communicationService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-logs'] });
      toast.success('Message queued for delivery');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  return {
    logs: logsData?.data || [],
    meta: logsData?.meta,
    isLoading,
    error,
    refetch,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
};

export const useCommunicationLog = (id: string) => {
  return useQuery({
    queryKey: ['communication-log', id],
    queryFn: () => communicationService.getLog(id),
    enabled: !!id,
    refetchInterval: 4000, // Refetch log details every 4 seconds for immediate webhook tracking when viewing
  });
};

export const useSyncCommunicationLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationService.syncLog(id),
    onSuccess: (updatedLog) => {
      queryClient.invalidateQueries({ queryKey: ['communication-log', updatedLog.id] });
      queryClient.invalidateQueries({ queryKey: ['communication-logs'] });
      toast.success('Latest log status fetched and updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync log status');
    },
  });
};
