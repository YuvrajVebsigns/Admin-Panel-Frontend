import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/contact.service';
import { ContactQueryParams, ReplyContactDto } from '../types/contact.types';
import toast from 'react-hot-toast';

export const useContacts = (params: ContactQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: contactsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactService.getContacts(params),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReplyContactDto }) =>
      contactService.replyContact(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.id] });
      toast.success('Reply submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit reply');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact submission deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete contact submission');
    },
  });

  return {
    contacts: contactsData?.data || [],
    meta: contactsData?.meta,
    isLoading,
    error,
    refetch,
    replyContact: replyMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
    isReplying: replyMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactService.getContact(id),
    enabled: !!id,
  });
};
