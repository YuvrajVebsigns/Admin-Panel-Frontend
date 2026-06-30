import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '@/services/communication.service';
import {
  MessageTemplateQueryParams,
  CreateMessageTemplateDto,
  UpdateMessageTemplateDto,
  SendTemplateMessageDto,
} from '../types/communication.types';
import toast from 'react-hot-toast';

export const useMessageTemplates = (params: MessageTemplateQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: templatesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['message-templates', params],
    queryFn: () => communicationService.getTemplates(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMessageTemplateDto) => communicationService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Message template created successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to create message template';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMessageTemplateDto }) =>
      communicationService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Message template updated successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update message template';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => communicationService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Message template deleted successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete message template';
      toast.error(message);
    },
  });

  const syncToMutation = useMutation({
    mutationFn: (id: string) => communicationService.syncTemplateToProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Local template successfully pushed/synced to Brevo');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to sync template to provider';
      toast.error(message);
    },
  });

  const syncFromMutation = useMutation({
    mutationFn: (externalId: number) => communicationService.syncTemplateFromProvider(externalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success('Successfully imported template design from Brevo');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to import template from Brevo';
      toast.error(message);
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: (data: SendTemplateMessageDto) => communicationService.sendTemplateMessage(data),
    onSuccess: () => {
      toast.success('Template testing email queued successfully');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to send template message';
      toast.error(message);
    },
  });

  const syncAllMutation = useMutation({
    mutationFn: () => communicationService.syncAllTemplates(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast.success(
        `Sync complete: Imported ${data.imported}, Updated ${data.updated}, Pushed ${data.pushed} templates. (${data.failed} failed)`,
      );
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to synchronize templates';
      toast.error(message);
    },
  });

  return {
    templates: templatesData?.data || [],
    meta: templatesData?.meta,
    isLoading,
    error,
    refetch,
    createTemplate: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTemplate: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTemplate: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    syncToProvider: syncToMutation.mutateAsync,
    isSyncingTo: syncToMutation.isPending,
    syncFromProvider: syncFromMutation.mutateAsync,
    isSyncingFrom: syncFromMutation.isPending,
    syncAllTemplates: syncAllMutation.mutateAsync,
    isSyncingAll: syncAllMutation.isPending,
    sendTestMessage: sendTestMutation.mutateAsync,
    isSendingTest: sendTestMutation.isPending,
  };
};

export const useMessageTemplate = (id: string) => {
  return useQuery({
    queryKey: ['message-template', id],
    queryFn: () => communicationService.getTemplate(id),
    enabled: !!id,
  });
};
