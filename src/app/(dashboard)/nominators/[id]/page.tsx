'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useNominations } from '@/modules/nominations/hooks/useNominations';
import { NominationStatus, RegistreeRef } from '@/modules/nominations/types/nomination.types';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { ArrowLeft, Mail, Phone, Calendar, Globe, Briefcase, MapPin, Award } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NominatorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const { nominations, isLoading, error } = useNominations({ nominatorId: id, limit: 100 });
  const { updateStatus, isUpdatingStatus } = useNominations();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading nominator details...</div>;
  }

  if (error || !nominations || nominations.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-error-500 mb-4">
          Failed to load nominator details or no submissions found.
        </p>
        <Button variant="outline" onClick={() => router.push('/nominators')}>
          Back to Nominators
        </Button>
      </div>
    );
  }

  const firstNomination = nominations[0];
  if (!firstNomination) {
    return <div className="p-8 text-center text-gray-500">No submissions found.</div>;
  }

  const nominator = firstNomination.nominatorId as RegistreeRef;
  const website = typeof firstNomination.websiteId === 'object' ? firstNomination.websiteId : null;

  const handleUpdateStatus = async (nominationId: string, status: NominationStatus) => {
    try {
      await updateStatus({
        id: nominationId,
        data: { status },
      });
      toast.success('Status updated for submission ' + nominationId);
    } catch (err) {
      // Handled by react query toast
    }
  };

  const STATUS_COLORS = {
    [NominationStatus.PENDING]:
      'bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-500/10 dark:text-warning-500 dark:border-warning-500/20',
    [NominationStatus.REVIEWED]:
      'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-500 dark:border-blue-500/20',
    [NominationStatus.APPROVED]:
      'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-500 dark:border-success-500/20',
    [NominationStatus.REJECTED]:
      'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-500 dark:border-error-500/20',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/nominators"
          className="p-2 bg-white dark:bg-navy-900 rounded-xl border border-gray-200 dark:border-navy-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nominator Details</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Reviewing all submissions by <span className="font-bold">{nominator.name}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Nominator Profile */}
        <div className="w-full lg:w-4/12 flex flex-col gap-6">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Nominator Profile
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Name & Email
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                    {nominator.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {nominator.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Briefcase size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Company
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {nominator.organization || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {nominator.city || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Phone size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {nominator.phoneNumber || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Globe size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Origin
                  </p>
                  {website ? (
                    <>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {website.name}
                      </p>
                      <p className="text-xs text-brand-500 font-medium">{website.domain}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Manual Entry</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl">
                  <Calendar size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-400 tracking-wider">
                    Submitted
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {new Date(firstNomination.submittedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Submissions List */}
        <div className="w-full lg:w-8/12">
          <div className="space-y-8">
            {nominations.map((nomination) => (
              <div
                key={nomination.id}
                className="border border-gray-100 dark:border-navy-800 rounded-3xl p-5 bg-gray-50/30 dark:bg-navy-800/10 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-navy-800 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar size={14} className="text-brand-500" />
                      Submitted on {new Date(nomination.submittedAt).toLocaleDateString()}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                      ID: {nomination.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Update Status:
                    </span>
                    <select
                      value={nomination.status}
                      onChange={(e) =>
                        handleUpdateStatus(nomination.id, e.target.value as NominationStatus)
                      }
                      disabled={isUpdatingStatus}
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border-none shadow-sm cursor-pointer appearance-none ${STATUS_COLORS[nomination.status]}`}
                    >
                      <option value={NominationStatus.PENDING}>PENDING</option>
                      <option value={NominationStatus.REVIEWED}>REVIEWED</option>
                      <option value={NominationStatus.APPROVED}>APPROVED</option>
                      <option value={NominationStatus.REJECTED}>REJECTED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {nomination.nominees.map((entry, index) => {
                    const nominee = entry.nomineeId as RegistreeRef;
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-2xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-sm">
                            {(nominee?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {nominee?.name || 'Unknown'}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Briefcase size={12} /> {nominee?.organization || 'No Company'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail size={12} /> {nominee?.email || 'N/A'}
                              </span>
                              {nominee?.phoneNumber && (
                                <span className="flex items-center gap-1">
                                  <Phone size={12} /> {nominee.phoneNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 flex md:flex-col items-center md:items-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-navy-800 pt-3 md:pt-0 md:pl-4">
                          <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                            Category
                          </p>
                          <Badge
                            color="info"
                            variant="light"
                            startIcon={<Award size={12} />}
                            className="font-bold text-[10px]"
                          >
                            {entry.category}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
