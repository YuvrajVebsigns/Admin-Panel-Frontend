'use client';
import { useSearchParams } from 'next/navigation';
import { MenuForm } from '@/modules/menu/components/MenuForm';
import { useMenus } from '@/modules/menu/hooks/useMenus';
import React, { Suspense } from 'react';

function UpdateMenuContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { allMenus, isLoading } = useMenus();

  const menuData = allMenus.find((m) => m.id === id);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">Loading menu details...</p>
      </div>
    );

  if (!menuData)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-error-50 dark:bg-error-500/10 p-4 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-error-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Menu item not found</h3>
        <p className="text-gray-500 mt-1 max-w-xs">
          The menu item you are looking for might have been deleted or the ID is invalid.
        </p>
      </div>
    );

  return (
    <div className="py-8 px-4">
      <MenuForm initialData={menuData} />
    </div>
  );
}

export default function UpdateMenuPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <UpdateMenuContent />
    </Suspense>
  );
}
