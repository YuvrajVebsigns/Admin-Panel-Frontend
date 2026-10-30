'use client';
import React from 'react';
import { WebsiteTable } from '@/modules/websites/components/WebsiteTable';
import Button from '@/components/ui/button/Button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useHasPermission } from '@/lib/permissions';
import { PERMISSIONS } from '@/constants/permissions';

export default function WebsitesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.roleKey === 'super_admin';
  const canCreateWebsite = useHasPermission(PERMISSIONS.WEBSITES_CREATE);
  const canViewWebsites = useHasPermission(PERMISSIONS.WEBSITES_VIEW);

  if (!canViewWebsites) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          You do not have permission to view websites. Please contact your system administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your network of 11 websites and their core settings.
          </p>
        </div>
        {(isSuperAdmin || canCreateWebsite) && (
          <Button
            onClick={() => router.push('/websites/create')}
            className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
          >
            <Plus size={18} />
            Add Website
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800">
        <WebsiteTable />
      </div>
    </div>
  );
}
