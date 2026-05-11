import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileService } from '../services/file.service';
import { QueryFileParams, UpdateFileData } from '../types/file.types';
import { toast } from 'react-hot-toast';

export const useFiles = (params: QueryFileParams = {}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['files', params],
    queryFn: () => fileService.getFiles(params),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => fileService.uploadFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fileService.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete file');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFileData }) =>
      fileService.updateFile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update file');
    },
  });

  return {
    files: data?.files || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    updateFile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
