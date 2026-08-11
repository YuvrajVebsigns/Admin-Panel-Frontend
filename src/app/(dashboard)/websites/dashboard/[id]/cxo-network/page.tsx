'use client';

import { ArrowLeft, UserCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { CxoNetworkManager } from '@/modules/websites/components/CxoNetworkManager';
import Button from '@/components/ui/button/Button';

export default function WebsiteCxoNetworkPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push(`/websites/dashboard/${websiteId}`)}
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-brand-500 hover:text-brand-500 transition-all dark:bg-navy-800 dark:border-navy-700 dark:hover:border-brand-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck size={24} className="text-brand-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                CXO Network Members
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage CXO Network members for this website.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/websites/dashboard/${websiteId}`)}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-theme-sm dark:bg-navy-800 dark:border-navy-700 p-6">
        <CxoNetworkManager siteId={websiteId} />
      </div>
    </div>
  );
}
