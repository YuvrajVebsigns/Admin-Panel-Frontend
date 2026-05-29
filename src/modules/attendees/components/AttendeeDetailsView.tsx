'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAttendee, useAttendees, useCheckInAttendee } from '../hooks/useAttendees';
import { AttendeeStatus, Attendee } from '../types/attendee.types';
import { AttendeePassModal } from './AttendeePassModal';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  QrCode,
  CheckCircle,
  Clock,
  User,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendeeDetailsView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: attendee, isLoading, error } = useAttendee(id);
  const checkInMutation = useCheckInAttendee();

  // Selected attendee for printing pass
  const [selectedPassAttendee, setSelectedPassAttendee] = useState<Attendee | null>(null);

  // Pagination states for history table
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 5;

  // Fetch paginated events this attendee is registered for (queried by their exact email)
  const { data: historyData, isLoading: isHistoryLoading } = useAttendees({
    email: attendee?.email,
    page: historyPage,
    limit: historyLimit,
  });

  const registrations = historyData?.data || [];
  const totalHistoryItems = historyData?.meta?.total || 0;
  const totalHistoryPages = historyData?.meta?.totalPages || 1;

  // Compute statistics (based on all history items if possible, or current page)
  const stats = React.useMemo(() => {
    if (!registrations.length) return { total: 0, attended: 0, rate: 0 };
    const total = totalHistoryItems || registrations.length;
    // Count attended registrations on current fetched list
    const attended = registrations.filter((r) => r.status === AttendeeStatus.CHECKED_IN).length;
    const rate = Math.round((attended / registrations.length) * 100);
    return { total, attended, rate };
  }, [registrations, totalHistoryItems]);

  const handleCheckIn = async (passCode: string, name: string) => {
    try {
      await checkInMutation.mutateAsync(passCode);
      toast.success(`${name} has been successfully checked in!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to check in attendee');
    }
  };

  const getStatusColor = (status: AttendeeStatus) => {
    switch (status) {
      case AttendeeStatus.CHECKED_IN:
        return 'success';
      case AttendeeStatus.REGISTERED:
        return 'primary';
      case AttendeeStatus.INVITED:
        return 'warning';
      case AttendeeStatus.BLOCKED:
        return 'error';
      default:
        return 'light';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
          <p className="text-sm text-gray-500 font-medium dark:text-gray-400">
            Retrieving attendee profile details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !attendee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <AlertCircle size={40} className="text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attendee Not Found</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          The requested registrant profile does not exist or has been deleted.
        </p>
        <Button variant="outline" onClick={() => router.push('/registrations')} className="mt-4">
          Return to Console
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-4 mb-4">
        <button
          onClick={() => router.push('/registrations')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Registrations
        </button>
        <div className="flex items-center gap-2.5">
          {attendee.status !== AttendeeStatus.CHECKED_IN &&
            attendee.status !== AttendeeStatus.BLOCKED && (
              <Button
                onClick={() => handleCheckIn(attendee.passCode, attendee.name)}
                className="flex items-center gap-2 rounded-xl text-xs py-2"
              >
                <CheckCircle size={15} />
                Instantly Check In
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attendee Card Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card: Profile Identity */}
          <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs relative overflow-hidden">
            {/* Header Glassmorphism Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 to-indigo-500" />

            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 flex items-center justify-center text-gray-500 shadow-md mb-4">
                <User size={36} className="text-gray-400 dark:text-navy-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                {attendee.name}
              </h3>
              {attendee.organization && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-navy-950 px-2.5 py-1 rounded-full border border-gray-100 dark:border-navy-900">
                  <Building size={12} className="text-brand-500" />
                  <span>{attendee.organization}</span>
                </div>
              )}

              <div className="mt-4">
                <Badge color={getStatusColor(attendee.status)} variant="light">
                  {attendee.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Profile Contact Details */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-navy-700 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                  <Mail size={15} className="text-gray-500 dark:text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    Email Address
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                    {attendee.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                  <Phone size={15} className="text-gray-500 dark:text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    Phone Number
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white">
                    {attendee.phone || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                  <Clock size={15} className="text-gray-500 dark:text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    Primary Event Registration
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-1">
                    {new Date(attendee.registeredAt || attendee.createdAt).toLocaleString(
                      undefined,
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History table & metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Events
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {isHistoryLoading ? '...' : stats.total}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Page Attended
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {isHistoryLoading ? '...' : stats.attended}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Attended Rate
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {isHistoryLoading ? '...' : `${stats.rate}%`}
                </h3>
              </div>
            </div>
          </div>

          {/* Table: Detailed Event History */}
          <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Registration & Attendance History
            </h4>

            {isHistoryLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-navy-700 rounded-2xl">
                <Calendar size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-navy-400">No events registered.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-navy-800 text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                        <th className="py-3.5 pr-4">Event Details</th>
                        <th className="py-3.5 px-4">Pass Code</th>
                        <th className="py-3.5 px-4">Registration Status</th>
                        <th className="py-3.5 px-4">Attended?</th>
                        <th className="py-3.5 pl-4 text-right">Pass Option</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-navy-850/50 text-xs">
                      {registrations.map((reg) => {
                        const ev = reg.eventId;
                        const title = typeof ev === 'object' && ev ? ev.title : 'Event details';
                        const type = typeof ev === 'object' && ev ? ev.type : '';
                        const isCheckedIn = reg.status === AttendeeStatus.CHECKED_IN;

                        return (
                          <tr
                            key={reg.id}
                            className="hover:bg-gray-50/50 dark:hover:bg-navy-950/20 transition-colors"
                          >
                            <td className="py-4 pr-4">
                              <div>
                                <p className="font-bold text-gray-800 dark:text-white line-clamp-1">
                                  {title}
                                </p>
                                {type && (
                                  <span className="text-[10px] font-bold text-brand-500 dark:text-brand-400 uppercase tracking-widest block mt-0.5">
                                    {type}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono font-bold text-gray-600 dark:text-navy-300">
                              {reg.passCode}
                            </td>
                            <td className="py-4 px-4">
                              <Badge color={getStatusColor(reg.status)} variant="light">
                                {reg.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              {isCheckedIn ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                                  <CheckCircle size={12} />
                                  <span className="text-[10px] uppercase">Attended (Yes)</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full w-fit">
                                  <Clock size={12} />
                                  <span className="text-[10px] uppercase">Not Attended (No)</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 pl-4 text-right">
                              <button
                                onClick={() => setSelectedPassAttendee(reg)}
                                title="View Ticket Boarding Pass"
                                className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg border border-gray-150 dark:border-navy-700 bg-white dark:bg-navy-900 text-brand-500 text-[11px] font-bold shadow-theme-xs hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-all"
                              >
                                <QrCode size={13} />
                                Boarding Pass
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginated Footer Controls */}
                {totalHistoryPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-navy-800 pt-4 mt-4">
                    <span className="text-[11px] text-gray-500 dark:text-navy-450 font-semibold">
                      Showing {registrations.length} of {totalHistoryItems} registrations
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setHistoryPage((prev) => Math.max(prev - 1, 1))}
                        disabled={historyPage === 1}
                        className="flex h-7 px-2.5 items-center justify-center rounded-lg border border-gray-200 dark:border-navy-700 text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-navy-950 font-bold transition-all text-[11px]"
                      >
                        Previous
                      </button>
                      <span className="text-[11px] font-bold text-gray-700 dark:text-navy-300 px-1">
                        Page {historyPage} of {totalHistoryPages}
                      </span>
                      <button
                        onClick={() =>
                          setHistoryPage((prev) => Math.min(prev + 1, totalHistoryPages))
                        }
                        disabled={historyPage === totalHistoryPages}
                        className="flex h-7 px-2.5 items-center justify-center rounded-lg border border-gray-200 dark:border-navy-700 text-gray-500 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-navy-950 font-bold transition-all text-[11px]"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Printable Badge Pass Modal */}
      {selectedPassAttendee && (
        <AttendeePassModal
          isOpen={!!selectedPassAttendee}
          onClose={() => setSelectedPassAttendee(null)}
          attendee={selectedPassAttendee}
        />
      )}
    </div>
  );
};
