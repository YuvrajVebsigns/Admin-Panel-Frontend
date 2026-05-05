'use client';
import { UserForm } from '@/modules/system-users/components/UserForm';
import { useParams } from 'next/navigation';
import { useSystemUser } from '@/modules/system-users/hooks/useSystemUsers';

export default function UpdateSystemUserPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: user, isLoading, isError } = useSystemUser(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex justify-center items-center h-64 text-error-500 font-medium">
        Failed to load user data. User might not exist.
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <UserForm initialData={user} />
    </div>
  );
}
