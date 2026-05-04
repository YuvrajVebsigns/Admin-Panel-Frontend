import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '@/services/roles.service';
import { Role } from '@/types/user.types';
import toast from 'react-hot-toast';

export const useRoles = () => {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: rolesService.getRoles,
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: Omit<Role, 'id'>) => rolesService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create role');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Role, 'id'>> }) =>
      rolesService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: rolesService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete role');
    },
  });

  return {
    roles: rolesQuery.data || [],
    isLoading: rolesQuery.isLoading,
    isError: rolesQuery.isError,
    error: rolesQuery.error,
    createRole: createRoleMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteRole: deleteRoleMutation.mutateAsync,
    isCreating: createRoleMutation.isPending,
    isUpdating: updateRoleMutation.isPending,
    isDeleting: deleteRoleMutation.isPending,
  };
};

export const useRole = (id: string | null) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => (id ? rolesService.getRoleById(id) : null),
    enabled: !!id,
  });
};
