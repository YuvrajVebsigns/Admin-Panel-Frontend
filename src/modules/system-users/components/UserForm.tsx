'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { User } from '@/types/user.types';
import { useRoles } from '@/modules/roles/hooks/useRoles';
import Button from '@/components/ui/button/Button';
import { useSystemUsers } from '../hooks/useSystemUsers';

const baseSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.string().min(1, 'Role is required'),
  isActive: z.boolean(),
});

interface UserFormData {
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  password?: string;
  [key: string]: unknown;
}

interface UserFormProps {
  initialData?: User | null;
}

export const UserForm: React.FC<UserFormProps> = ({ initialData }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const [showPassword, setShowPassword] = useState(false);
  const { roles, isLoading: isLoadingRoles } = useRoles();
  const { createUser, updateUser, isCreating, isUpdating } = useSystemUsers();

  const userSchema = React.useMemo(
    () =>
      baseSchema.extend({
        password: isEdit
          ? z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal(''))
          : z.string().min(6, 'Password must be at least 6 characters'),
      }),
    [isEdit],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    resolver: zodResolver(userSchema) as any,
    defaultValues: initialData
      ? {
          email: initialData.email,
          fullName: initialData.fullName,
          role: initialData.role?.id || '',
          isActive: initialData.isActive,
        }
      : {
          email: '',
          fullName: '',
          role: '',
          password: '',
          isActive: true,
        },
  });

  useEffect(() => {
    if (initialData) {
      setValue('role', initialData.role?.id || '');
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEdit && initialData) {
        const updateData = { ...data };
        if (!updateData.password) delete updateData.password;
        // @ts-ignore
        delete updateData.email;
        await updateUser({ id: initialData.id, data: updateData });
      } else {
        await createUser(data);
      }
      router.push('/system-user');
    } catch (error) {
      // Error is handled by the mutation hooks (toast)
    }
  };

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/system-user')}
        className="flex items-center gap-2 text-gray-500 hover:text-brand-500 mb-6 transition-colors font-medium group text-sm"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to System Users List
      </button>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-700 overflow-hidden shadow-sm transition-colors duration-300"
      >
        <div className="p-8 border-b border-gray-100 dark:border-navy-700 bg-gray-50/30 dark:bg-navy-900/30">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? `Edit System User: ${initialData.fullName}` : 'Create New System User'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure system user properties and role assignments.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-error-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                {...register('fullName')}
                error={!!errors.fullName}
                hint={errors.fullName?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                id="email"
                placeholder="john@example.com"
                {...register('email')}
                error={!!errors.email}
                hint={errors.email?.message}
                disabled={isEdit}
              />
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  {...register('password')}
                  error={!!errors.password}
                  hint={errors.password?.message}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-hidden"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>
            )}

            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">New Password (Optional)</Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Leave empty to keep current"
                  {...register('password')}
                  error={!!errors.password}
                  hint={errors.password?.message}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-hidden"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-error-500">*</span>
              </Label>
              <Select
                options={roleOptions}
                value={watch('role')}
                onChange={(value) => setValue('role', value as string)}
                placeholder="Select Role"
                disabled={isLoadingRoles}
              />
              {errors.role && <p className="mt-1 text-xs text-error-500">{errors.role.message}</p>}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Status Settings
            </h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="w-5 h-5 rounded border-gray-300 accent-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                />
                <Label
                  htmlFor="isActive"
                  className="mb-0 cursor-pointer font-medium text-gray-700 dark:text-gray-300"
                >
                  User is Active
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 dark:bg-navy-900/50 border-t border-gray-100 dark:border-navy-700 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/system-user')}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-8 shadow-lg shadow-brand-500/20"
          >
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
};
