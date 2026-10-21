import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sidebarMenuService } from '../services/sidebar-menu.service';
import {
  SidebarMenu,
  CreateSidebarMenuDto,
  UpdateSidebarMenuDto,
  SidebarMenuReorderDto,
} from '@/modules/sidebar-menu/types/sidebar-menu.types';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';

export function useSidebarMenus() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const menusQuery = useQuery({
    queryKey: ['menus'],
    queryFn: sidebarMenuService.getSidebarMenus,
  });

  const allSidebarMenusQuery = useQuery({
    queryKey: ['menus', 'all', page, limit, debouncedSearch],
    queryFn: () => sidebarMenuService.getAllSidebarMenus({ page, limit, search: debouncedSearch }),
  });

  // Separate query for form dropdowns that needs a larger list without search/pagination interference
  const dropdownSidebarMenusQuery = useQuery({
    queryKey: ['menus', 'dropdown'],
    queryFn: () => sidebarMenuService.getAllSidebarMenus({ page: 1, limit: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSidebarMenuDto) => {
      const promise = sidebarMenuService.createSidebarMenu(data);
      toast.promise(promise, {
        loading: 'Creating menu item...',
        success: (_res: SidebarMenu) => 'SidebarMenu created successfully!',
        error: (err: Error) => err.message || 'Failed to create menu',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sidebarMenus'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSidebarMenuDto }) => {
      const promise = sidebarMenuService.updateSidebarMenu(id, data);
      toast.promise(promise, {
        loading: 'Updating menu item...',
        success: (_res: SidebarMenu) => 'SidebarMenu updated successfully!',
        error: (err: Error) => err.message || 'Failed to update menu',
      });
      return promise;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-sidebarMenus'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const promise = sidebarMenuService.deleteSidebarMenu(id);
      toast.promise(promise, {
        loading: 'Deleting menu...',
        success: () => 'SidebarMenu deleted successfully!',
        error: (err: Error) => err.message || 'Failed to delete menu',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sidebarMenus'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: SidebarMenuReorderDto[]) => {
      const promise = sidebarMenuService.reorderSidebarMenus(items);
      toast.promise(promise, {
        loading: 'Updating order...',
        success: 'SidebarMenu order updated!',
        error: 'Failed to update order',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['admin-sidebarMenus'] });
    },
  });

  return {
    menus: menusQuery.data ?? [],
    allSidebarMenus: allSidebarMenusQuery.data?.data ?? [],
    pagination: allSidebarMenusQuery.data?.meta,
    dropdownSidebarMenus: dropdownSidebarMenusQuery.data?.data ?? [],
    isLoading: menusQuery.isLoading || allSidebarMenusQuery.isLoading,
    isError: menusQuery.isError || allSidebarMenusQuery.isError,
    // Pagination & Search controls
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,

    createSidebarMenu: createMutation.mutateAsync,
    updateSidebarMenu: updateMutation.mutateAsync,
    deleteSidebarMenu: deleteMutation.mutateAsync,
    reorderSidebarMenus: reorderMutation.mutateAsync,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      reorderMutation.isPending,
  };
}

export function useSidebarMenu(id: string | null) {
  return useQuery({
    queryKey: ['menus', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const item = await sidebarMenuService.getSidebarMenuById(id);
        if (item) return item;
      } catch (_err) {
        // Fallback if backend endpoint is not yet live or on older server
      }
      const res = await sidebarMenuService.getAllSidebarMenus({ page: 1, limit: 1000 });
      const found = res.data.find((m) => m.id === id || (m as { _id?: string })._id === id);
      return found ?? null;
    },
    enabled: !!id,
  });
}
