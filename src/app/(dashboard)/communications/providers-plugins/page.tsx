'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { CommunicationProvidersTab } from '@/modules/communications/components/CommunicationProvidersTab';
import { AlertTriangle } from 'lucide-react';

export default function ProvidersPluginsPage() {
  const { user } = useAuthStore();

  const isSuperAdmin = user?.role?.roleKey === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          Only users with the Super Admin role have permission to configure third-party integration
          providers and plugins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Providers / Plugins</h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
          Configure third-party API integration keys, fallback hierarchies, and webhook trackers.
        </p>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6">
        <CommunicationProvidersTab />
      </div>
    </div>
  );
}
