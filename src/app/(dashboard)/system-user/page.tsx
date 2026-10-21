'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { UserTable } from '@/modules/system-users/components/UserTable';
import { User } from '@/types/user.types';
import { useSystemUsers } from '@/modules/system-users/hooks/useSystemUsers';
import Button from '@/components/ui/button/Button';
import { Plus } from 'lucide-react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useGlobalModal } from '@/hooks/useGlobalModal';

export default function SystemUsersPage() {
  const router = useRouter();
  const { deleteUser } = useSystemUsers();
  const { confirm } = useGlobalModal();

  const handleCreate = () => {
    router.push('/system-user/create');
  };

  const handleEdit = (user: User) => {
    router.push(`/system-user/update/${user.id}`);
  };

  const handleDelete = async (user: User) => {
    confirm({
      title: 'Delete System User',
      message: `Are you sure you want to delete "${user.fullName}"? This action cannot be undone.`,
      confirmText: 'Delete User',
      type: 'danger',
      onConfirm: async () => {
        await deleteUser(user.id);
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageBreadcrumb pageTitle="System Users" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage System Users</h1>
          <p className="text-sm text-gray-500">Create, edit and manage administrative users</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={20} />
          Add New User
        </Button>
      </div>

      <UserTable onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
