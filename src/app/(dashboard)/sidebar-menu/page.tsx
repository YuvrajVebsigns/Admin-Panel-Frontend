'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MenuTable } from '@/modules/menu/components/MenuTable';
import { MenuTreeBuilder } from '@/modules/menu/components/MenuTreeBuilder';
import Button from '@/components/ui/button/Button';
import { Plus, List, ListTree } from 'lucide-react';

export default function MenuManagementPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

  const handleCreate = () => {
    router.push('/sidebar-menu/create');
  };

  return (
    <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            Sidebar Menu Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Architect your system's navigation hierarchy and permissions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 tracking-tighter ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 shadow-xl text-brand-600 dark:text-brand-400 scale-[1.05]'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <List size={18} /> Table
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 tracking-tighter ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-gray-700 shadow-xl text-brand-600 dark:text-brand-400 scale-[1.05]'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <ListTree size={18} /> Reorder
            </button>
          </div>

          <Button
            onClick={handleCreate}
            startIcon={<Plus size={22} />}
            className="shadow-2xl shadow-brand-500/30 active:scale-95 py-4 px-8 text-base font-black rounded-2xl"
          >
            Create Menu
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {viewMode === 'table' ? (
          <MenuTable />
        ) : (
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl">
            <MenuTreeBuilder />
          </div>
        )}
      </div>
    </div>
  );
}
