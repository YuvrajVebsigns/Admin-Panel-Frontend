import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsService } from '@/services/forms.service';
import { FormSubmissionQueryParams, SubmissionStatus } from '../types/form.types';
import toast from 'react-hot-toast';

export const useFormSubmissions = (formId: string, params: FormSubmissionQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: submissionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-form-submissions', formId, params],
    queryFn: () => formsService.getSubmissions(formId, params),
    enabled: !!formId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      submissionId,
      status,
      adminNotes,
    }: {
      submissionId: string;
      status: SubmissionStatus;
      adminNotes?: string;
    }) => formsService.updateSubmissionStatus(formId, submissionId, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-form-submissions', formId] });
      queryClient.invalidateQueries({ queryKey: ['admin-form-analytics', formId] });
      toast.success('Submission status updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update submission status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (submissionId: string) => formsService.deleteSubmission(formId, submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-form-submissions', formId] });
      queryClient.invalidateQueries({ queryKey: ['admin-form-analytics', formId] });
      toast.success('Submission deleted successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete submission');
    },
  });

  return {
    submissions: submissionsData?.data || [],
    meta: submissionsData?.meta,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteSubmission: deleteMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useFormAnalytics = (formId: string) => {
  return useQuery({
    queryKey: ['admin-form-analytics', formId],
    queryFn: () => formsService.getSubmissionAnalytics(formId),
    enabled: !!formId,
  });
};
