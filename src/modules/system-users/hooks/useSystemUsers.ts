import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemUsersService, UserQueryParams } from '@/services/system-users.service';
import toast from 'react-hot-toast';

export const useSystemUsers = (params: UserQueryParams = {}) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['system-users', params],
    queryFn: () => systemUsersService.getUsers(params),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => systemUsersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      systemUsersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: systemUsersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });

  return {
    users: usersQuery.data?.data || [],
    meta: usersQuery.data?.meta,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
};

export const useSystemUser = (id: string | null) => {
  return useQuery({
    queryKey: ['system-users', id],
    queryFn: () => (id ? systemUsersService.getUserById(id) : null),
    enabled: !!id,
  });
};
