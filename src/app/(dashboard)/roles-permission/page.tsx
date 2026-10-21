'use client';
import React from 'react';
import { useRoles } from '@/modules/roles/hooks/useRoles';
import RoleTable from '@/modules/roles/components/RoleTable';
import { Role } from '@/types/user.types';
import { Plus, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';

export default function RolesPage() {
  const router = useRouter();
  const { roles, isLoading, updateRole, deleteRole } = useRoles();

  const handleCreateNew = () => {
    router.push('/roles-permission/create');
  };

  const handleEdit = (role: Role) => {
    router.push(`/roles-permission/update?id=${role.id}`);
  };

  const handleToggleActive = async (role: Role) => {
    await updateRole({ id: role.id, data: { isActive: !role.isActive } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-brand-500" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage user roles and assign granular permissions for system access.
          </p>
        </div>

        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus size={18} />
          Create New Role
        </Button>
      </div>

      <RoleTable
        roles={roles}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={deleteRole}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}
