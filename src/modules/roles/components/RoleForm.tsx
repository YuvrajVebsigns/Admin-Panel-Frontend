'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Role } from '@/types/user.types';
import InputField from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { PERMISSION_GROUPS } from '../constants/permissions';
import { useAuthStore } from '@/store/auth.store';

interface RoleFormProps {
  initialData?: Role | null;
  onSubmit: (data: Omit<Role, 'id'>) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSubmit, isLoading, onCancel }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Omit<Role, 'id'>>({
    defaultValues: {
      name: '',
      roleKey: '',
      isActive: true,
      permissions: [],
    },
  });

  const { roleKey: currentUserRole } = useAuthStore();
  const selectedPermissions = watch('permissions') || [];
  const roleName = watch('name');

  // Filter permission groups based on user role
  const filteredPermissionGroups = React.useMemo(() => {
    if (currentUserRole === 'super_admin') return PERMISSION_GROUPS;

    // Create a copy and remove System Settings
    const { 'System Settings': _, ...others } = PERMISSION_GROUPS;
    return others;
  }, [currentUserRole]);

  // Auto-generate roleKey from name
  useEffect(() => {
    if (roleName) {
      const generatedKey = roleName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      setValue('roleKey', generatedKey, { shouldDirty: true, shouldValidate: true });
    }
  }, [roleName, setValue]);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        roleKey: initialData.roleKey,
        isActive: initialData.isActive,
        permissions: initialData.permissions,
      });
    } else {
      reset({
        name: '',
        roleKey: '',
        isActive: true,
        permissions: [],
      });
    }
  }, [initialData, reset]);

  const togglePermission = (permission: string) => {
    const isSelecting = !selectedPermissions.includes(permission);
    let newPermissions: string[];

    if (isSelecting) {
      newPermissions = [...selectedPermissions, permission];
      // Dependency: If selecting any action (e.g., .create), ensure .view is also selected
      if (!permission.endsWith('.view')) {
        const prefix = permission.split('.')[0];
        // Find if there's a corresponding .view permission in any group
        const viewPermission = Object.values(PERMISSION_GROUPS)
          .flat()
          .find((p) => p === `${prefix}.view`);

        if (viewPermission && !newPermissions.includes(viewPermission)) {
          newPermissions.push(viewPermission);
        }
      }
    } else {
      newPermissions = selectedPermissions.filter((p) => p !== permission);
      // Dependency: If deselecting a .view permission, deselect all related actions (e.g., .create, .update)
      if (permission.endsWith('.view')) {
        const prefix = permission.split('.')[0];
        newPermissions = newPermissions.filter((p) => !p.startsWith(`${prefix}.`));
      }
    }

    setValue('permissions', newPermissions, { shouldDirty: true, shouldValidate: true });
  };

  const toggleGroup = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every((p) => selectedPermissions.includes(p));
    let newPermissions: string[];

    if (allSelected) {
      newPermissions = selectedPermissions.filter((p) => !groupPermissions.includes(p));
    } else {
      const uniqueNew = groupPermissions.filter((p) => !selectedPermissions.includes(p));
      newPermissions = [...selectedPermissions, ...uniqueNew];

      // Ensure that if any action was added, its corresponding .view is also added
      // (even if it wasn't in the same group, though usually it is)
      uniqueNew.forEach((perm) => {
        if (!perm.endsWith('.view')) {
          const prefix = perm.split('.')[0];
          const viewPermission = Object.values(PERMISSION_GROUPS)
            .flat()
            .find((p) => p === `${prefix}.view`);

          if (viewPermission && !newPermissions.includes(viewPermission)) {
            newPermissions.push(viewPermission);
          }
        }
      });
    }

    setValue('permissions', newPermissions, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Role Basic Info Card */}
      <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-2xl p-6 shadow-theme-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <Label htmlFor="name">Role Name</Label>
            <InputField
              id="name"
              placeholder="e.g. Content Manager"
              {...register('name', { required: 'Role name is required' })}
              error={!!errors.name}
              hint={errors.name?.message}
            />
            {/* Hidden roleKey input */}
            <input type="hidden" {...register('roleKey')} />
          </div>

          <div className="flex items-center gap-3 pb-3">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500/20 dark:border-navy-600 dark:bg-navy-950 accent-brand-500 cursor-pointer"
            />
            <Label htmlFor="isActive" className="mb-0 cursor-pointer text-base font-semibold">
              Active Status
            </Label>
          </div>
        </div>
      </div>

      {/* Permissions Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(filteredPermissionGroups).map(([group, permissions]) => {
          const allSelected = permissions.every((p) => selectedPermissions.includes(p));

          return (
            <div
              key={group}
              className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-2xl overflow-hidden shadow-theme-sm"
            >
              <div className="bg-gray-50/50 dark:bg-navy-950/50 px-5 py-4 border-b border-gray-100 dark:border-navy-800 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900 dark:text-white">{group}</span>
                <button
                  type="button"
                  onClick={() => toggleGroup(permissions)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    allSelected
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-brand-500'
                  }`}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="p-5 flex flex-col gap-6">
                {Object.entries(
                  permissions.reduce(
                    (acc, perm) => {
                      const prefix = perm.split('.')[0] || 'general';
                      if (!acc[prefix]) acc[prefix] = [];
                      acc[prefix].push(perm);
                      return acc;
                    },
                    {} as Record<string, string[]>,
                  ),
                ).map(([prefix, subPermissions]) => (
                  <div key={prefix} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-navy-400">
                        {prefix.replace('-', ' ')}
                      </span>
                      <div className="h-px grow bg-gray-100 dark:bg-navy-800/50" />
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {subPermissions.map((perm) => {
                        const isView = perm.endsWith('.view');
                        const viewPerm = subPermissions.find((p) => p === `${prefix}.view`);
                        const isViewSelected = viewPerm
                          ? selectedPermissions.includes(viewPerm)
                          : true;
                        const isSelected = selectedPermissions.includes(perm);
                        const isDisabled = !isView && !isViewSelected;

                        return (
                          <button
                            key={perm}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => togglePermission(perm)}
                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-full border transition-all duration-200 select-none ${
                              isDisabled
                                ? 'opacity-35 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200 dark:bg-navy-950/20 dark:text-navy-600 dark:border-navy-900'
                                : isSelected
                                  ? 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/30 ring-1 ring-brand-500/10 shadow-xs'
                                  : 'bg-gray-50/50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-gray-900 dark:bg-navy-950/30 dark:text-navy-300 dark:border-navy-800/60 dark:hover:bg-navy-950/70 dark:hover:text-white'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                isSelected
                                  ? 'bg-brand-500 scale-100 shadow-[0_0_8px_#4f46e5]'
                                  : 'bg-gray-300 dark:bg-navy-700 scale-75'
                              }`}
                            />
                            <span className="capitalize">
                              {perm.split('.').slice(1).join(' ').replace('_', ' ') ||
                                perm.split('.').join(' ').replace('_', ' ')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          {initialData ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
