'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Role } from '@/types/user.types';
import InputField from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { PERMISSION_GROUPS } from '../constants/permissions';

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

  const selectedPermissions = watch('permissions') || [];
  const roleName = watch('name');

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
      <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-2xl p-6 shadow-theme-sm">
        <div className="grid grid-cols-1 gap-6">
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500/20 dark:border-navy-600 dark:bg-navy-950 accent-brand-500"
            />
            <Label htmlFor="isActive" className="mb-0 cursor-pointer">
              Role is Active
            </Label>
          </div>

          <div className="space-y-4">
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => {
                const allSelected = permissions.every((p) => selectedPermissions.includes(p));

                return (
                  <div
                    key={group}
                    className="border border-gray-100 dark:border-navy-800 rounded-xl overflow-hidden"
                  >
                    <div className="bg-gray-50 dark:bg-navy-950/50 px-4 py-2 border-b border-gray-100 dark:border-navy-800 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {group}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGroup(permissions)}
                        className={`text-xs font-bold transition-colors ${
                          allSelected
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-500 hover:text-brand-500'
                        }`}
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-3">
                      {permissions.map((perm) => {
                        const isView = perm.endsWith('.view');
                        const prefix = perm.split('.')[0];
                        const viewPerm = permissions.find((p) => p === `${prefix}.view`);
                        const isViewSelected = viewPerm
                          ? selectedPermissions.includes(viewPerm)
                          : true;

                        return (
                          <label
                            key={perm}
                            className={`flex items-center gap-3 cursor-pointer group ${
                              !isView && !isViewSelected ? 'opacity-50 grayscale-[0.5]' : ''
                            }`}
                          >
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm)}
                                onChange={() => togglePermission(perm)}
                                disabled={!isView && !isViewSelected}
                                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500/20 dark:border-navy-600 dark:bg-navy-950 accent-brand-500 disabled:cursor-not-allowed"
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-navy-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                              {perm.split('.').join(' ').replace('_', ' ')}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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
