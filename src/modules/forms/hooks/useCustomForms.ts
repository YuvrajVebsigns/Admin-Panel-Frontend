import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsService } from '@/services/forms.service';
import {
  CustomFormQueryParams,
  CreateCustomFormDto,
  UpdateCustomFormDto,
  FormQuestion,
  FormStatus,
} from '../types/form.types';
import toast from 'react-hot-toast';

export const useCustomForms = (params: CustomFormQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: formsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-forms', params],
    queryFn: () => formsService.getForms(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => formsService.deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
      toast.success('Form deleted successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete form');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FormStatus }) =>
      formsService.updateFormStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
      toast.success('Form status updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update form status');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => formsService.duplicateForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
      toast.success('Form duplicated successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to duplicate form');
    },
  });

  return {
    forms: formsData?.data || [],
    meta: formsData?.meta,
    isLoading,
    error,
    refetch,
    deleteForm: deleteMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    duplicateForm: duplicateMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
};

export const useCustomForm = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: form,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-form', id],
    queryFn: () => formsService.getForm(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCustomFormDto) => formsService.updateForm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-form', id] });
      toast.success('Form settings updated successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update form settings');
    },
  });

  const updateQuestionsMutation = useMutation({
    mutationFn: (questions: FormQuestion[]) => formsService.updateFormQuestions(id, questions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-form', id] });
      toast.success('Form questions saved successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save form questions');
    },
  });

  return {
    form,
    isLoading,
    error,
    refetch,
    updateForm: updateMutation.mutateAsync,
    updateQuestions: updateQuestionsMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isSavingQuestions: updateQuestionsMutation.isPending,
  };
};

export const useCreateCustomForm = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateCustomFormDto) => formsService.createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forms'] });
      toast.success('Custom form created successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create custom form');
    },
  });

  return {
    createForm: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
