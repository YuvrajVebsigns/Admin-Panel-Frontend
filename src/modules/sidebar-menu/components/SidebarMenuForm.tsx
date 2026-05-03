'use client';
import React, { useEffect, useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { SidebarMenu, CreateSidebarMenuDto } from '@/modules/sidebar-menu/types/sidebar-menu.types';
import { useSidebarMenus } from '../hooks/useSidebarMenus';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { IconPicker } from '@/components/ui/IconPicker';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarSidebarMenuFormProps {
  initialData?: SidebarMenu | null;
}

const generatePermissionKey = (path: string): string => {
  if (!path) return '';
  const cleanPath = path.trim().replace(/^\/+/, '').replace(/\/+/g, ':');

  return cleanPath ? `${cleanPath}.view` : '';
};

export const SidebarMenuForm: React.FC<SidebarSidebarMenuFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { createSidebarMenu, updateSidebarMenu, dropdownSidebarMenus, isProcessing } =
    useSidebarMenus();
  const [isPermissionManuallyEdited, setIsPermissionManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateSidebarMenuDto>({
    defaultValues: {
      isVisible: true,
      isActive: true,
      parentId: '',
      name: '',
      path: '',
      group: '',
      icon: '',
      permissionKey: '',
    },
  });

  const isEditing = !!initialData;
  const watchedParentId = useWatch({ control, name: 'parentId' });
  const watchedPath = useWatch({ control, name: 'path' });
  const watchedGroup = useWatch({ control, name: 'group' });
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      const pId = initialData.parentId
        ? typeof initialData.parentId === 'object'
          ? (initialData.parentId as { _id?: string; id?: string })._id ||
            (initialData.parentId as { _id?: string; id?: string }).id
          : initialData.parentId
        : '';

      reset({
        name: initialData.name,
        path: initialData.path,
        icon: initialData.icon,
        permissionKey: initialData.permissionKey,
        parentId: pId,
        group: initialData.group,
        order: initialData.order,
        isVisible: initialData.isVisible,
        isActive: initialData.isActive,
      });
      setIsPermissionManuallyEdited(true);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (watchedParentId) {
      const selectedParent = dropdownSidebarMenus.find((m) => m.id === watchedParentId);
      if (selectedParent?.group) {
        setValue('group', selectedParent.group, { shouldValidate: true });
      }
    }
  }, [watchedParentId, dropdownSidebarMenus, setValue]);

  const handlePathBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let pathValue = e.target.value.trim();
    if (!pathValue) return;

    if (!pathValue.startsWith('/')) {
      pathValue = `/${pathValue}`;
      setValue('path', pathValue, { shouldValidate: true });
      toast('Added leading "/"', { icon: 'ℹ️' });
    }

    if (!isPermissionManuallyEdited && !isEditing) {
      const autoKey = generatePermissionKey(pathValue);
      setValue('permissionKey', autoKey, { shouldValidate: true });
    }
  };

  const handlePermissionKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) {
      setIsPermissionManuallyEdited(true);
      setValue('permissionKey', e.target.value);
    }
  };

  const onSubmit = async (data: CreateSidebarMenuDto) => {
    try {
      const payload = {
        ...data,
        parentId: data.parentId === '' ? null : data.parentId,
        name: (data.name || '').trim(),
        path: (data.path || '').trim(),
        icon: (data.icon || '').trim(),
        group: (data.group || '').trim(),
        permissionKey: (data.permissionKey || '').trim(),
      };

      if (isEditing && initialData) {
        await updateSidebarMenu({ id: initialData.id, data: payload });
      } else {
        const { order: _order, ...createData } = payload;
        await createSidebarMenu(createData);
      }

      router.push('/sidebar-menu');
    } catch (error) {
      // Handled globally
    }
  };

  const parentOptions = [
    { value: '', label: 'None (Root Level)' },
    ...dropdownSidebarMenus
      .filter((m) => m.id !== initialData?.id)
      .map((m) => ({ value: m.id, label: m.name })),
  ];

  const existingGroups = Array.from(
    new Set(dropdownSidebarMenus.map((m) => m.group).filter(Boolean)),
  );
  const filteredGroups = existingGroups.filter((g) =>
    g?.toLowerCase().includes((watchedGroup || '').toLowerCase()),
  );

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/sidebar-menu')}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-500 mb-6 transition-colors font-medium group text-sm"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to SidebarMenu List
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
      >
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? `Edit SidebarMenu: ${initialData.name}` : 'Create New SidebarMenu'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure your navigation item properties and permissions.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                SidebarMenu Name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'SidebarMenu name is required' })}
                placeholder="e.g. Dashboard"
                error={!!errors.name}
                hint={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">
                Path Segment <span className="text-error-500">*</span>
              </Label>
              <Input
                id="path"
                {...register('path', {
                  required: 'Path is required',
                  pattern: { value: /^\//, message: 'Path must start with /' },
                })}
                onBlur={handlePathBlur}
                placeholder="e.g. /dashboard"
                error={!!errors.path}
                hint={errors.path?.message}
              />
              {(watchedParentId || watchedPath) && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Final URL Preview
                  </p>
                  <code className="text-xs text-brand-600 dark:text-brand-400 font-mono break-all">
                    {(() => {
                      const selectedParent = dropdownSidebarMenus.find(
                        (m) => m.id === watchedParentId,
                      );
                      const pPath = (selectedParent?.path || '').replace(/\/+$/, '');
                      const cPath = (watchedPath || '').startsWith('/')
                        ? watchedPath || ''
                        : `/${watchedPath || ''}`;
                      return `${pPath}${cPath}` || '/';
                    })()}
                  </code>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">
                Icon Selection <span className="text-error-500">*</span>
              </Label>
              <Controller
                name="icon"
                control={control}
                rules={{ required: 'Icon is required' }}
                render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} />}
              />
              {errors.icon && (
                <p className="mt-1.5 text-xs text-error-500 font-medium">{errors.icon.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent SidebarMenu</Label>
              <Select
                options={parentOptions}
                value={watchedParentId || ''}
                onChange={(value) => setValue('parentId', value, { shouldDirty: true })}
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="group">Group Name</Label>
              <Input
                id="group"
                {...register('group')}
                placeholder="e.g. MAIN"
                readOnly={!!watchedParentId}
                className={
                  watchedParentId
                    ? 'bg-gray-50 dark:bg-gray-800 opacity-70 cursor-not-allowed border-gray-200'
                    : ''
                }
                onFocus={() => {
                  if (!watchedParentId) setIsGroupDropdownOpen(true);
                }}
                onBlur={() => {
                  // Delay closing to allow click event on dropdown to fire
                  setTimeout(() => setIsGroupDropdownOpen(false), 200);
                }}
                autoComplete="off"
              />
              {isGroupDropdownOpen && filteredGroups.length > 0 && !watchedParentId && (
                <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-theme-md dark:border-gray-700 dark:bg-gray-800">
                  {filteredGroups.map((g) => (
                    <li
                      key={g}
                      className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-brand-400 transition-colors"
                      onMouseDown={(e) => {
                        // Prevent blur event from firing before click
                        e.preventDefault();
                        setValue('group', g, { shouldValidate: true, shouldDirty: true });
                        setIsGroupDropdownOpen(false);
                      }}
                    >
                      {g}
                    </li>
                  ))}
                </ul>
              )}
              {watchedParentId && (
                <p className="text-[11px] font-medium text-brand-500 mt-1 italic">
                  Auto-filled from parent menu
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissionKey">Permission Key</Label>
              <Input
                id="permissionKey"
                {...register('permissionKey')}
                onChange={handlePermissionKeyChange}
                placeholder="e.g. dashboard:view"
                readOnly={isEditing}
                className={
                  isEditing
                    ? 'bg-gray-50 dark:bg-gray-800 opacity-70 cursor-not-allowed border-gray-200'
                    : ''
                }
              />
              {isEditing ? (
                <p className="text-[11px] font-medium text-gray-400 mt-1 italic">
                  Cannot be changed after creation
                </p>
              ) : (
                !isPermissionManuallyEdited && (
                  <p className="text-[11px] font-medium text-brand-500 mt-1 italic">
                    Auto-generated from path
                  </p>
                )
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Visibility & Status
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isVisible"
                  {...register('isVisible')}
                  className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                />
                <Label
                  htmlFor="isVisible"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  Visible in Sidebar
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                />
                <Label
                  htmlFor="isActive"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  Active Status
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/sidebar-menu')}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isProcessing}
            className="px-8 shadow-lg shadow-brand-500/20"
          >
            {isProcessing ? 'Saving...' : isEditing ? 'Update SidebarMenu' : 'Create SidebarMenu'}
          </Button>
        </div>
      </form>
    </div>
  );
};
