'use client';
import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { User } from '@/types/user.types';
import { useSystemUsers } from '../hooks/useSystemUsers';
import { Edit, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

interface UserTableProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ onEdit, onDelete }) => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { users, meta, isLoading, updateUser } = useSystemUsers(params);

  const handleToggleActive = async (user: User) => {
    await updateUser({ id: user.id, data: { isActive: !user.isActive } });
  };

  const columns: Column<User>[] = [
    {
      header: 'User',
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.fullName}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <UserIcon size={20} />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (user) => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-brand-500" />
          <span className="text-sm font-medium">{user.role?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (user) => (
        <button
          onClick={() => handleToggleActive(user)}
          className={`group relative overflow-hidden flex items-center justify-center px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors duration-300 ${
            user.isActive
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/15 dark:hover:text-success-500'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {user.isActive ? 'Click to deactivate' : 'Click to activate'}
          </span>
          <span className="invisible whitespace-nowrap">
            {user.isActive ? 'Click to deactivate' : 'Click to activate'}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(user)}
            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      isLoading={isLoading}
      serverSide
      totalItems={meta?.total}
      page={params.page}
      limit={params.limit}
      search={params.search}
      onPageChange={(page) => setParams((p) => ({ ...p, page }))}
      onPageSizeChange={(limit) => setParams((p) => ({ ...p, limit, page: 1 }))}
      onSearchChange={(search) => setParams((p) => ({ ...p, search, page: 1 }))}
    />
  );
};
