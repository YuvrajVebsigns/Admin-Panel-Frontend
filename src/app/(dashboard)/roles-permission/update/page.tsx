'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRoles, useRole } from '@/modules/roles/hooks/useRoles';
import RoleForm from '@/modules/roles/components/RoleForm';
import { Role } from '@/types/user.types';
import { Shield, Loader2 } from 'lucide-react';

function UpdateRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { updateRole, isUpdating } = useRoles();
  const { data: role, isLoading: isLoadingRole } = useRole(id);

  const handleCancel = () => {
    router.push('/roles-permission');
  };

  const handleSubmit = async (data: Omit<Role, 'id'>) => {
    if (id) {
      await updateRole({ id, data });
      router.push('/roles-permission');
    }
  };

  if (isLoadingRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading role details...</p>
      </div>
    );
  }

  if (!role && !isLoadingRole) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
        <h2 className="text-lg font-bold text-red-800 dark:text-red-400">Role Not Found</h2>
        <p className="text-red-600 dark:text-red-400/80 mt-2">
          The role you are trying to edit does not exist or has been deleted.
        </p>
        <button
          onClick={handleCancel}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-brand-500" />
            Edit Role: {role?.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update permissions and role settings.
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Back to List
        </button>
      </div>

      <RoleForm
        initialData={role}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function UpdateRolePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      }
    >
      <UpdateRoleContent />
    </Suspense>
  );
}
