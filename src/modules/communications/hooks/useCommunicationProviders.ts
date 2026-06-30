import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '@/services/communication.service';
import {
  CommunicationProvider,
  CreateCommunicationProviderDto,
  UpdateCommunicationProviderDto,
} from '../types/communication.types';
import toast from 'react-hot-toast';

export const useCommunicationProviders = () => {
  const queryClient = useQueryClient();

  const {
    data: providers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['communication-providers'],
    queryFn: () => communicationService.getProviders(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCommunicationProviderDto) => communicationService.createProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-providers'] });
      toast.success('Provider plugin registered successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to register provider plugin';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommunicationProviderDto }) =>
      communicationService.updateProvider(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['communication-providers'] });

      const previousProviders = queryClient.getQueryData(['communication-providers']);

      // Optimistically update the provider in cache
      queryClient.setQueryData(
        ['communication-providers'],
        (old: CommunicationProvider[] | undefined) =>
          (old || []).map((p) => (p.id === id ? { ...p, ...data } : p)),
      );

      return { previousProviders };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-providers'] });
      toast.success('Provider settings updated successfully');
    },
    onError: (err: unknown, _variables, context) => {
      // Rollback on error
      if (context?.previousProviders) {
        queryClient.setQueryData(['communication-providers'], context.previousProviders);
      }
      const message = err instanceof Error ? err.message : 'Failed to update provider settings';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => communicationService.deleteProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-providers'] });
      toast.success('Provider config deleted successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete provider config';
      toast.error(message);
    },
  });

  const checkHealthMutation = useMutation({
    mutationFn: (name: string) => communicationService.checkProviderHealth(name),
    onSuccess: (res) => {
      if (res.isHealthy) {
        toast.success(`Provider "${res.name}" API is healthy and reachable`);
      } else {
        toast.error(`Provider "${res.name}" API check failed. Please verify credentials`);
      }
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to perform health check';
      toast.error(message);
    },
  });

  // Separate silent mutation for the "Test API Key" button — no toasts,
  // the component drives its own visual feedback (success/failure badges).
  const testApiKeyMutation = useMutation({
    mutationFn: (name: string) => communicationService.checkProviderHealth(name),
  });

  const registerWebhookMutation = useMutation({
    mutationFn: (url: string) => communicationService.registerBrevoWebhook(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-providers'] });
      toast.success('Brevo webhook registered programmatically successfully!');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to register Brevo webhook.';
      toast.error(message);
    },
  });

  const unregisterWebhookMutation = useMutation({
    mutationFn: () => communicationService.unregisterBrevoWebhook(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-providers'] });
      toast.success('Brevo webhook removed successfully!');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to remove Brevo webhook.';
      toast.error(message);
    },
  });

  const sendersQuery = useQuery({
    queryKey: ['brevo-senders'],
    queryFn: () => communicationService.getBrevoSenders(),
    retry: false,
  });

  const createSenderMutation = useMutation({
    mutationFn: (data: { email: string; name: string }) =>
      communicationService.createBrevoSender(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brevo-senders'] });
      toast.success('Brevo sender registered successfully. Check email for verification!');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to register Brevo sender';
      toast.error(message);
    },
  });

  const deleteSenderMutation = useMutation({
    mutationFn: (id: number) => communicationService.deleteBrevoSender(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brevo-senders'] });
      toast.success('Brevo sender deleted successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete Brevo sender';
      toast.error(message);
    },
  });

  return {
    providers,
    isLoading,
    error,
    refetch,
    createProvider: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProvider: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProvider: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    checkProviderHealth: checkHealthMutation.mutateAsync,
    isCheckingHealth: checkHealthMutation.isPending,
    testApiKey: testApiKeyMutation.mutateAsync,
    isTestingApiKey: testApiKeyMutation.isPending,
    registerBrevoWebhook: registerWebhookMutation.mutateAsync,
    isRegisteringWebhook: registerWebhookMutation.isPending,
    unregisterBrevoWebhook: unregisterWebhookMutation.mutateAsync,
    isUnregisteringWebhook: unregisterWebhookMutation.isPending,
    senders: Array.isArray(sendersQuery.data)
      ? sendersQuery.data
      : sendersQuery.data?.senders || [],
    isLoadingSenders: sendersQuery.isLoading,
    refetchSenders: sendersQuery.refetch,
    createBrevoSender: createSenderMutation.mutateAsync,
    isCreatingSender: createSenderMutation.isPending,
    deleteBrevoSender: deleteSenderMutation.mutateAsync,
    isDeletingSender: deleteSenderMutation.isPending,
  };
};
