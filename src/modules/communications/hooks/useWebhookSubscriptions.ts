import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '@/services/communication.service';
import {
  WebhookQueryParams,
  CreateWebhookDto,
  UpdateWebhookDto,
} from '../types/communication.types';
import toast from 'react-hot-toast';

export const useWebhookSubscriptions = (params: WebhookQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: webhooksData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['webhook-subscriptions', params],
    queryFn: () => communicationService.getWebhooks(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWebhookDto) => communicationService.createWebhook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook subscription created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create webhook');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookDto }) =>
      communicationService.updateWebhook(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['webhook-subscription', variables.id] });
      toast.success('Webhook subscription updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update webhook');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => communicationService.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook subscription deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete webhook');
    },
  });

  return {
    webhooks: webhooksData?.data || [],
    meta: webhooksData?.meta,
    isLoading,
    error,
    refetch,
    createWebhook: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateWebhook: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteWebhook: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useWebhookSubscription = (id: string) => {
  return useQuery({
    queryKey: ['webhook-subscription', id],
    queryFn: () => communicationService.getWebhook(id),
    enabled: !!id,
  });
};
