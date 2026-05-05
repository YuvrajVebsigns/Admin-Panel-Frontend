'use client';
import React from 'react';
import Select from '@/components/form/Select';
import { useRoles } from '@/modules/roles/hooks/useRoles';

interface UserFiltersProps {
  roleId: string;
  isActive: string;
  onRoleChange: (roleId: string) => void;
  onStatusChange: (status: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  roleId,
  isActive,
  onRoleChange,
  onStatusChange,
}) => {
  const { roles, isLoading: isLoadingRoles } = useRoles();

  const roleOptions = [
    { value: '', label: 'All Roles' },
    ...roles.map((role) => ({
      value: role.id,
      label: role.name,
    })),
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="w-full sm:w-48">
        <Select
          options={roleOptions}
          value={roleId}
          onChange={onRoleChange}
          placeholder="Filter by Role"
          disabled={isLoadingRoles}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          options={statusOptions}
          value={isActive}
          onChange={onStatusChange}
          placeholder="Filter by Status"
        />
      </div>
    </div>
  );
};
