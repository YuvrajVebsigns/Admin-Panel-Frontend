import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../services/menu.service';
import { Menu, CreateMenuDto, UpdateMenuDto, MenuReorderDto } from '../types/menu.types';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';

export function useMenus() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const menusQuery = useQuery({
    queryKey: ['menus'],
    queryFn: menuService.getMenus,
  });

  const allMenusQuery = useQuery({
    queryKey: ['menus', 'all', page, limit, debouncedSearch],
    queryFn: () => menuService.getAllMenus({ page, limit, search: debouncedSearch }),
  });

  // Separate query for form dropdowns that needs a larger list without search/pagination interference
  const dropdownMenusQuery = useQuery({
    queryKey: ['menus', 'dropdown'],
    queryFn: () => menuService.getAllMenus({ page: 1, limit: 1000 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMenuDto) => {
      const promise = menuService.createMenu(data);
      toast.promise(promise, {
        loading: 'Creating menu item...',
        success: (_res: Menu) => 'Menu created successfully!',
        error: (err: Error) => err.message || 'Failed to create menu',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'all'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuDto }) => {
      const promise = menuService.updateMenu(id, data);
      toast.promise(promise, {
        loading: 'Updating menu item...',
        success: (_res: Menu) => 'Menu updated successfully!',
        error: (err: Error) => err.message || 'Failed to update menu',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'all'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const promise = menuService.deleteMenu(id);
      toast.promise(promise, {
        loading: 'Deleting menu...',
        success: () => 'Menu deleted successfully!',
        error: (err: Error) => err.message || 'Failed to delete menu',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'all'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: MenuReorderDto[]) => {
      const promise = menuService.reorderMenus(items);
      toast.promise(promise, {
        loading: 'Updating order...',
        success: 'Menu order updated!',
        error: 'Failed to update order',
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });

  return {
    menus: menusQuery.data ?? [],
    allMenus: allMenusQuery.data?.data ?? [],
    pagination: allMenusQuery.data?.meta,
    dropdownMenus: dropdownMenusQuery.data?.data ?? [],
    isLoading: menusQuery.isLoading || allMenusQuery.isLoading,
    isError: menusQuery.isError || allMenusQuery.isError,
    // Pagination & Search controls
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,

    createMenu: createMutation.mutateAsync,
    updateMenu: updateMutation.mutateAsync,
    deleteMenu: deleteMutation.mutateAsync,
    reorderMenus: reorderMutation.mutateAsync,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      reorderMutation.isPending,
  };
}
