'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { nominationService } from '@/services/nomination.service';
import Button from '@/components/ui/button/Button';
import { useWebsite } from '@/modules/websites/hooks/useWebsites';
import { useMutation } from '@tanstack/react-query';
import { WebsiteNominationStatusResponse } from '@/modules/nominations/types/nomination.types';
import toast from 'react-hot-toast';

const NOMINATION_OPTIONS = [
  { value: true, label: 'Activate nomination form' },
  { value: false, label: 'Deactivate nomination form' },
];

export default function WebsiteNominationStatusPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;
  const { website } = useWebsite(websiteId);
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const { mutateAsync, status: mutationStatus } = useMutation<
    WebsiteNominationStatusResponse,
    Error,
    boolean
  >({
    mutationFn: (active: boolean) =>
      nominationService.updateWebsiteNominationStatus(websiteId, { isActive: active }),
    onSuccess: (data) => {
      toast.success('Nomination status updated successfully');
      setIsActive(data.isActive);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update nomination status');
    },
  });

  const handleStatusClick = async (active: boolean) => {
    setIsActive(active);
    await mutateAsync(active);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-brand-500 hover:text-brand-500 transition-all dark:bg-navy-800 dark:border-navy-700 dark:hover:border-brand-500"
            onClick={() => router.push(`/websites/dashboard/${websiteId}`)}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nomination Status</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage the nomination form status for this website.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push(`/websites/dashboard/${websiteId}`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-theme-sm dark:bg-navy-800 dark:border-navy-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {website?.name || 'Website'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current nomination form status is{' '}
              <span
                className={`font-semibold ${website?.nominationActive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {website?.nominationActive ? 'Active' : 'Disabled'}
              </span>
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-navy-900">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Website ID</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{websiteId}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {NOMINATION_OPTIONS.map((option) => {
            const isSelected =
              isActive !== null
                ? isActive === option.value
                : website?.nominationActive === option.value;
            return (
              <Button
                key={option.label}
                variant={isSelected ? 'primary' : 'outline'}
                onClick={() => handleStatusClick(option.value)}
                className="justify-between"
                isLoading={mutationStatus === 'pending' && isSelected}
              >
                <span>{option.label}</span>
                {isSelected ? <CheckCircle size={18} /> : <XCircle size={18} />}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
