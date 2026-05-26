import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { navbarService } from '@/services/navbar.service';
import { NavbarItem } from '../types/cms.types';
import toast from 'react-hot-toast';

export const useNavbar = (params: { siteId: string; position?: string; nested?: boolean }) => {
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['navbar-items', params],
    queryFn: () => navbarService.getNavbarItems(params),
    enabled: !!params.siteId,
  });

  const createItemMutation = useMutation({
    mutationFn: (data: Partial<NavbarItem>) => navbarService.createNavbarItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navbar-items'] });
      toast.success('Navigation item created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create navigation item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NavbarItem> }) =>
      navbarService.updateNavbarItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navbar-items'] });
      toast.success('Navigation item updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update navigation item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => navbarService.deleteNavbarItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navbar-items'] });
      toast.success('Navigation item deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete navigation item');
    },
  });

  const reorderItemsMutation = useMutation({
    mutationFn: (data: {
      siteId: string;
      position: string;
      orders: Array<{ id: string; order: number }>;
    }) => navbarService.reorderNavbarItems(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navbar-items'] });
      toast.success('Navigation order saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reorder items');
    },
  });

  return {
    items,
    isLoading,
    error,
    refetch,
    createItem: createItemMutation.mutateAsync,
    isCreating: createItemMutation.isPending,
    updateItem: updateItemMutation.mutateAsync,
    isUpdating: updateItemMutation.isPending,
    deleteItem: deleteItemMutation.mutateAsync,
    isDeleting: deleteItemMutation.isPending,
    reorderItems: reorderItemsMutation.mutateAsync,
    isReordering: reorderItemsMutation.isPending,
  };
};

export const useNavbarItem = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['navbar-item', id],
    queryFn: () => navbarService.getNavbarItemById(id),
    enabled: !!id,
  });

  return {
    item: data,
    isLoading,
    error,
  };
};
