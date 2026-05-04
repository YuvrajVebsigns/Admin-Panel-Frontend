'use client';
import React from 'react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Role } from '@/types/user.types';
import { Edit, Trash2, Shield } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';

interface RoleTableProps {
  roles: Role[];
  isLoading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
  onToggleActive: (role: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const columns: Column<Role>[] = [
    {
      header: 'Role Name',
      accessor: (role) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
            <Shield size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-white">{role.name}</span>
            <span className="text-[10px] text-gray-400 font-mono">{role.roleKey}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Permissions',
      accessor: (role) => (
        <div className="flex flex-wrap gap-1 max-w-[400px]">
          {role.permissions.slice(0, 5).map((perm) => (
            <Badge
              key={perm}
              variant="light"
              size="sm"
              className="bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-navy-300"
            >
              {perm}
            </Badge>
          ))}
          {role.permissions.length > 5 && (
            <Badge variant="light" size="sm" className="bg-gray-100 dark:bg-navy-800 text-gray-400">
              +{role.permissions.length - 5} more
            </Badge>
          )}
          {role.permissions.length === 0 && (
            <span className="text-xs text-gray-400 italic">No permissions</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (role) => (
        <button
          onClick={() => onToggleActive(role)}
          className={`group relative overflow-hidden flex items-center justify-center px-3.5 py-1.5 rounded-full font-medium text-xs transition-colors duration-300 ${
            role.isActive
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/15 dark:hover:text-error-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500 hover:bg-success-50 hover:text-success-600 dark:hover:bg-success-500/15 dark:hover:text-success-500'
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
            {role.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 translate-y-full group-hover:translate-y-0 whitespace-nowrap">
            {role.isActive ? 'Click to inactive' : 'Click to active'}
          </span>
          <span className="invisible whitespace-nowrap">
            {role.isActive ? 'Click to inactive' : 'Click to active'}
          </span>
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: (role) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(role)}
            className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-all"
            title="Edit Role"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
                onDelete(role.id);
              }
            }}
            className="p-2 text-gray-500 hover:text-error-500 hover:bg-error-500/10 rounded-lg transition-all"
            title="Delete Role"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={roles}
      columns={columns}
      searchPlaceholder="Search roles..."
      isLoading={isLoading}
    />
  );
};

export default RoleTable;
