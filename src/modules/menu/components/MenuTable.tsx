'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from '../types/menu.types';
import { useMenus } from '../hooks/useMenus';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { Edit, Trash2 } from 'lucide-react';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export const MenuTable: React.FC = () => {
  const router = useRouter();
  const {
    allMenus,
    pagination,
    isLoading,
    deleteMenu,
    updateMenu,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
  } = useMenus();
  const { confirm } = useGlobalModal();

  const handleToggleVisible = async (menu: Menu) => {
    await updateMenu({ id: menu.id, data: { isVisible: !menu.isVisible } });
  };

  const handleToggleActive = async (menu: Menu) => {
    await updateMenu({ id: menu.id, data: { isActive: !menu.isActive } });
  };

  const handleDelete = async (id: string, name: string) => {
    confirm({
      title: 'Delete Menu Item',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        await deleteMenu(id);
      },
    });
  };

  const columns: Column<Menu>[] = [
    {
      header: 'Menu Item',
      accessor: (menu) => (
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
            <DynamicIcon name={menu.icon || ''} size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {menu.name}
            </span>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">
              {menu.group || 'UNGROUPED'}
            </span>
          </div>
        </div>
      ),
      className: 'min-w-[220px]',
    },
    {
      header: 'Path',
      accessor: (menu) => (
        <code className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-[12px] font-mono text-brand-600 dark:text-brand-400">
          {menu.path}
        </code>
      ),
    },
    {
      header: 'Parent',
      accessor: (menu) => {
        const parentName =
          typeof menu.parentId === 'object' && menu.parentId !== null
            ? (menu.parentId as { name?: string }).name
            : null;

        return (
          <span className="text-[13px] font-medium text-gray-600 dark:text-gray-400">
            {parentName || <span className="opacity-30 italic text-xs">None (Root)</span>}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: (menu) => (
        <button
          onClick={() => handleToggleActive(menu)}
          className={`group relative overflow-hidden flex items-center justify-center px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors duration-300 ${
            menu.isActive
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/15 dark:hover:text-success-500'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {menu.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {menu.isActive ? 'Click to inactive' : 'Click to active'}
          </span>
          <span className="invisible whitespace-nowrap">
            {menu.isActive ? 'Click to inactive' : 'Click to active'}
          </span>
        </button>
      ),
    },
    {
      header: 'Visible to Others',
      accessor: (menu) => (
        <button
          onClick={() => handleToggleVisible(menu)}
          className={`group relative overflow-hidden flex items-center justify-center px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors duration-300 ${
            menu.isVisible
              ? 'bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white/80'
              : 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80 hover:bg-blue-light-50 hover:text-blue-light-500 dark:hover:bg-blue-light-500/15 dark:hover:text-blue-light-500'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {menu.isVisible ? 'Visible' : 'Hidden'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {menu.isVisible ? 'Click to hide' : 'Click to visible'}
          </span>
          <span className="invisible whitespace-nowrap">
            {menu.isVisible ? 'Click to not hide' : 'Click to visible'}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (menu) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push(`/sidebar-menu/update?id=${menu.id}`)}
            className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-md transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(menu.id, menu.name)}
            className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-md transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <DataTable<Menu>
      data={allMenus}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Search menus by name, group, or path..."
      serverSide
      totalItems={pagination?.total}
      page={page}
      limit={limit}
      search={search}
      onPageChange={setPage}
      onPageSizeChange={setLimit}
      onSearchChange={setSearch}
    />
  );
};
