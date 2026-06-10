import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { Report } from '../types/cms.types';
import toast from 'react-hot-toast';

export const useWebsiteReports = (params: {
  websiteId?: string;
  search?: string;
  isPublished?: string;
  page?: number;
  limit?: number;
}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['website-reports', params],
    queryFn: () => reportService.getReports(params),
  });

  const createReportMutation = useMutation({
    mutationFn: (data: Partial<Report>) => reportService.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-reports'] });
      toast.success('Report created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create report');
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Report> }) =>
      reportService.updateReport(id, data),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: ['website-reports'] });
      queryClient.invalidateQueries({ queryKey: ['website-report', updatedReport.id] });
      toast.success('Report updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update report');
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id: string) => reportService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-reports'] });
      toast.success('Report deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete report');
    },
  });

  return {
    reports: (data?.data || []).map(
      (r: Report & { _id?: string }): Report => ({ ...r, id: r.id || r._id || '' }),
    ),
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    createReport: createReportMutation.mutateAsync,
    isCreating: createReportMutation.isPending,
    updateReport: updateReportMutation.mutateAsync,
    isUpdating: updateReportMutation.isPending,
    deleteReport: deleteReportMutation.mutateAsync,
    isDeleting: deleteReportMutation.isPending,
  };
};

export const useWebsiteReport = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['website-report', id],
    queryFn: () => reportService.getReportById(id),
    enabled: !!id,
  });

  return {
    report: data
      ? ({ ...data, id: data.id || (data as unknown as { _id?: string })._id || '' } as Report)
      : null,
    isLoading,
    error,
  };
};

export const useWebsiteReportDownloaders = (reportId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['website-report-downloaders', reportId],
    queryFn: () => reportService.getReportDownloaders(reportId),
    enabled: !!reportId,
  });

  return {
    downloaders: data || [],
    isLoading,
    error,
    refetch,
  };
};
