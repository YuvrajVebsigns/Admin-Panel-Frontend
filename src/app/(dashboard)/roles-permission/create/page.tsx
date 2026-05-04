'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useRoles } from '@/modules/roles/hooks/useRoles';
import RoleForm from '@/modules/roles/components/RoleForm';
import { Role } from '@/types/user.types';
import { Shield } from 'lucide-react';

export default function CreateRolePage() {
  const router = useRouter();
  const { createRole, isCreating } = useRoles();

  const handleCancel = () => {
    router.push('/roles-permission');
  };

  const handleSubmit = async (data: Omit<Role, 'id'>) => {
    await createRole(data);
    router.push('/roles-permission');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-brand-500" />
            Create New Role
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define a new role and assign specific permissions.
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Back to List
        </button>
      </div>

      <RoleForm onSubmit={handleSubmit} isLoading={isCreating} onCancel={handleCancel} />
    </div>
  );
}
