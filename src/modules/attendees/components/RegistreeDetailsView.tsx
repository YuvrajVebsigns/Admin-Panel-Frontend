'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRegistree } from '../hooks/useRegistrees';
import { RegistreeHistoryItem, RegistreeEvent } from '../types/registree.types';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  User,
  AlertCircle,
  Loader2,
  Users,
  Globe,
  Eye,
  Ticket,
  Copy,
  Check,
  Printer,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export const RegistreeDetailsView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: registree, isLoading, error } = useRegistree(id);

  // Pass modal state
  const [selectedPass, setSelectedPass] = useState<RegistreeHistoryItem | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pagination for history
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 5;

  const eventIds = registree?.eventIds || [];
  const history = registree?.history || [];

  // Paginate history locally since registree detail returns all history
  const totalHistoryItems = history.length;
  const totalHistoryPages = Math.ceil(totalHistoryItems / historyLimit);
  const paginatedHistory = history.slice(
    (historyPage - 1) * historyLimit,
    historyPage * historyLimit,
  );

  // Stats
  const stats = React.useMemo(() => {
    if (!history.length) return { total: 0, attended: 0, rate: 0 };
    const total = history.length;
    const attended = history.filter((h) => h.attended).length;
    const rate = Math.round((attended / total) * 100);
    return { total, attended, rate };
  }, [history]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
          <p className="text-sm text-gray-500 font-medium dark:text-gray-400">
            Retrieving contact profile details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !registree) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <AlertCircle size={40} className="text-red-500 mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact Not Found</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          The requested registrant profile does not exist or has been deleted.
        </p>
        <Button variant="outline" onClick={() => router.push('/registrations')} className="mt-4">
          Return to Registrations
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs relative overflow-hidden">
            {/* Header Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 to-indigo-500" />

            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 flex items-center justify-center text-gray-500 shadow-md mb-4">
                <User size={36} className="text-gray-400 dark:text-navy-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                {registree.name}
              </h3>
              {registree.organization && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-navy-950 px-2.5 py-1 rounded-full border border-gray-100 dark:border-navy-900">
                  <Building size={12} className="text-brand-500" />
                  <span>{registree.organization}</span>
                </div>
              )}
            </div>

            {/* Contact Details */}
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
                    {registree.email}
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
                    {registree.phoneNumber
                      ? `${registree.countryCode || ''} ${registree.phoneNumber}`.trim()
                      : '—'}
                  </p>
                </div>
              </div>

              {registree.websiteId && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <Globe size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Origin Website
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {typeof registree.websiteId === 'object'
                        ? registree.websiteId.name
                        : registree.websiteId}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                  <Clock size={15} className="text-gray-500 dark:text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    First Registered
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-1">
                    {new Date(registree.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Events Sidebar */}
          {eventIds.length > 0 && (
            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                Registered Events ({eventIds.length})
              </h4>
              <div className="space-y-3">
                {eventIds.map((ev: RegistreeEvent) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-800"
                  >
                    <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1">
                        {ev.title}
                      </p>
                      {ev.type && (
                        <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">
                          {ev.type}
                        </span>
                      )}
                      <p className="text-[10px] text-gray-400 dark:text-navy-400 mt-0.5">
                        {new Date(ev.startDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge color={ev.status === 'ACTIVE' ? 'success' : 'warning'} variant="light">
                      {ev.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics */}
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
                  {stats.total}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Attended
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {stats.attended}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Attend Rate
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {stats.rate}%
                </h3>
              </div>
            </div>
          </div>

          {/* Registration History Table */}
          <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Registration & Attendance History
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-navy-700 rounded-2xl">
                <Calendar size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-navy-400">
                  No event registrations found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-navy-800 text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                        <th className="py-3.5 pr-4">Event</th>
                        <th className="py-3.5 px-4">Pass Code</th>
                        <th className="py-3.5 px-4">Organization</th>
                        <th className="py-3.5 px-4">Attended</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                        <th className="py-3.5 pl-4 text-right">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-navy-850/50 text-xs">
                      {paginatedHistory.map((item: RegistreeHistoryItem, idx: number) => {
                        // Try to find corresponding event from eventIds
                        const matchEvent =
                          item.event || eventIds.find((ev) => ev.id === item.eventId?.toString());

                        return (
                          <tr
                            key={`${item.passCode || idx}`}
                            className="hover:bg-gray-50/50 dark:hover:bg-navy-950/20 transition-colors"
                          >
                            <td className="py-4 pr-4">
                              <div>
                                <p className="font-bold text-gray-800 dark:text-white line-clamp-1">
                                  {matchEvent?.title || 'Event'}
                                </p>
                                {matchEvent?.type && (
                                  <span className="text-[10px] font-bold text-brand-500 dark:text-brand-400 uppercase tracking-widest block mt-0.5">
                                    {matchEvent.type}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono font-bold text-gray-600 dark:text-navy-300">
                              {item.passCode || '—'}
                            </td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                              {item.organization || '—'}
                            </td>
                            <td className="py-4 px-4">
                              {item.attended ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                                  <CheckCircle size={12} />
                                  <span className="text-[10px] uppercase">Yes</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full w-fit">
                                  <Clock size={12} />
                                  <span className="text-[10px] uppercase">No</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {matchEvent?.id && (
                                  <button
                                    onClick={() => router.push(`/events/${matchEvent.id}/view`)}
                                    className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-brand-500/10 text-gray-500 hover:text-brand-500 flex items-center justify-center border border-gray-100 dark:bg-navy-900/50 dark:border-navy-800 transition-colors"
                                    title="View Event Details"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                                {item.qrCode && (
                                  <button
                                    onClick={() => setSelectedPass(item)}
                                    className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-500 flex items-center justify-center border border-gray-100 dark:bg-navy-900/50 dark:border-navy-800 transition-colors"
                                    title="View Generated Pass"
                                  >
                                    <Ticket size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 pl-4 text-right text-gray-500 dark:text-gray-400">
                              {item.savedAt
                                ? new Date(item.savedAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
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
                      Showing {paginatedHistory.length} of {totalHistoryItems} registrations
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

        {/* Admission Ticket Modal */}
        <Modal
          isOpen={!!selectedPass}
          onClose={() => {
            setSelectedPass(null);
            setCopied(false);
          }}
          size="sm"
        >
          {selectedPass &&
            (() => {
              const passEvent =
                selectedPass.event ||
                eventIds.find((ev) => ev.id === selectedPass.eventId?.toString());
              return (
                <div className="p-6 text-center space-y-6">
                  {/* Print Stylesheet injection */}
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                  @media print {
                    /* Hide everything */
                    body * {
                      visibility: hidden !important;
                    }
                    /* Show only the printable ticket card */
                    #print-pass-area, #print-pass-area * {
                      visibility: visible !important;
                    }
                    #print-pass-area {
                      position: absolute !important;
                      left: 50% !important;
                      top: 45% !important;
                      transform: translate(-50%, -50%) !important;
                      width: 360px !important;
                      border: 1px dashed #000000 !important;
                      background: #ffffff !important;
                      box-shadow: none !important;
                      margin: 0 !important;
                      border-radius: 16px !important;
                      padding: 20px !important;
                    }
                    /* Force dark text and clean contrast */
                    #print-pass-area h4,
                    #print-pass-area p,
                    #print-pass-area span,
                    #print-pass-area div,
                    #print-pass-area svg {
                      color: #000000 !important;
                      fill: #000000 !important;
                    }
                    #print-pass-area .bg-white {
                      background: #ffffff !important;
                    }
                    #print-pass-area button,
                    #print-pass-area .copy-btn {
                      display: none !important;
                      visibility: hidden !important;
                    }
                    @page {
                      size: portrait;
                      margin: 0;
                    }
                  }
                `,
                    }}
                  />

                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                      Admission Pass
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-navy-400 mt-1">
                      Show this QR code at the event check-in desk
                    </p>
                  </div>

                  {/* Ticket Card Container */}
                  <div
                    id="print-pass-area"
                    className="relative rounded-3xl bg-gradient-to-b from-white to-gray-50 dark:from-navy-850 dark:to-navy-900 border border-gray-150 dark:border-navy-750 shadow-xl overflow-hidden text-left transition-all"
                  >
                    {/* Top Premium Color strip */}
                    <div className="h-2 w-full bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-600 animate-gradient-x" />

                    {/* Header / Event Details */}
                    <div className="p-5 pb-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {passEvent?.type ? (
                          <span className="text-[9px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 dark:bg-brand-500/20 px-2 py-0.5 rounded-full border border-brand-500/20">
                            {passEvent.type}
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-navy-800 px-2 py-0.5 rounded-full">
                            Event
                          </span>
                        )}
                        <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {selectedPass.attended ? 'Verified / Attended' : 'Valid Pass'}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {passEvent?.title || 'Event Admission'}
                      </h4>

                      {/* Date and Location with Icons */}
                      <div className="space-y-1.5 pt-1 text-[10px] text-gray-500 dark:text-navy-300">
                        {passEvent?.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar
                              size={12}
                              className="text-brand-500 dark:text-brand-400 shrink-0"
                            />
                            <span className="font-semibold text-gray-700 dark:text-navy-200">
                              {new Date(passEvent.startDate).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                        {passEvent?.location?.address && (
                          <div className="flex items-start gap-2">
                            <span className="text-brand-500 dark:text-brand-400 text-xs leading-none shrink-0">
                              📍
                            </span>
                            <span className="truncate leading-normal">
                              {passEvent.location.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ticket Notch Divider */}
                    <div className="relative h-6 flex items-center justify-between">
                      {/* Left Notch */}
                      <div className="absolute left-[-11px] h-5 w-5 rounded-full bg-white dark:bg-navy-950 border border-gray-150 dark:border-navy-750 z-10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.03)]" />
                      {/* Right Notch */}
                      <div className="absolute right-[-11px] h-5 w-5 rounded-full bg-white dark:bg-navy-950 border border-gray-150 dark:border-navy-750 z-10 shadow-[inset_2px_0_4px_rgba(0,0,0,0.03)]" />
                      {/* Perforation dotted line */}
                      <div className="w-full border-t-2 border-dashed border-gray-200 dark:border-navy-750 mx-4" />
                    </div>

                    {/* QR and Codes Section */}
                    <div className="p-5 pt-2 space-y-5 text-center">
                      {/* QR Code Frame */}
                      <div className="relative group mx-auto w-44 h-44 bg-white p-3 rounded-2xl border border-gray-150 shadow-md transition-all hover:scale-105 duration-300">
                        {selectedPass.qrCode ? (
                          <img
                            src={selectedPass.qrCode}
                            alt="Admission Pass QR"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-[10px]">
                            QR Not Available
                          </div>
                        )}
                      </div>

                      {/* Security Code */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400 dark:text-navy-500">
                          Pass Code
                        </p>
                        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-navy-950 px-3.5 py-1.5 rounded-xl border border-gray-200/50 dark:border-navy-800/80">
                          <span className="text-sm font-mono font-bold tracking-wider text-gray-800 dark:text-white">
                            {selectedPass.passCode || '—'}
                          </span>
                          {selectedPass.passCode && (
                            <button
                              onClick={() => handleCopy(selectedPass.passCode!)}
                              className="copy-btn text-gray-400 hover:text-brand-500 transition-colors p-0.5 rounded hover:bg-gray-200 dark:hover:bg-navy-900"
                              title="Copy Code"
                            >
                              {copied ? (
                                <Check size={12} className="text-emerald-500 font-extrabold" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Barcode details */}
                      <div className="pt-1 pb-1 opacity-70 dark:opacity-50 flex flex-col items-center gap-1">
                        <svg
                          className="w-48 h-6 text-gray-800 dark:text-white"
                          viewBox="0 0 100 20"
                          fill="currentColor"
                        >
                          <rect x="0" y="0" width="2" height="20" />
                          <rect x="3" y="0" width="1" height="20" />
                          <rect x="5" y="0" width="3" height="20" />
                          <rect x="10" y="0" width="1" height="20" />
                          <rect x="12" y="0" width="4" height="20" />
                          <rect x="18" y="0" width="2" height="20" />
                          <rect x="22" y="0" width="1" height="20" />
                          <rect x="24" y="0" width="3" height="20" />
                          <rect x="29" y="0" width="2" height="20" />
                          <rect x="33" y="0" width="4" height="20" />
                          <rect x="38" y="0" width="1" height="20" />
                          <rect x="40" y="0" width="2" height="20" />
                          <rect x="44" y="0" width="1" height="20" />
                          <rect x="47" y="0" width="3" height="20" />
                          <rect x="52" y="0" width="2" height="20" />
                          <rect x="56" y="0" width="4" height="20" />
                          <rect x="62" y="0" width="1" height="20" />
                          <rect x="65" y="0" width="2" height="20" />
                          <rect x="68" y="0" width="3" height="20" />
                          <rect x="73" y="0" width="1" height="20" />
                          <rect x="76" y="0" width="4" height="20" />
                          <rect x="82" y="0" width="2" height="20" />
                          <rect x="85" y="0" width="1" height="20" />
                          <rect x="88" y="0" width="3" height="20" />
                          <rect x="93" y="0" width="1" height="20" />
                          <rect x="96" y="0" width="4" height="20" />
                        </svg>
                        <span className="text-[7.5px] font-mono text-gray-400 dark:text-navy-450 tracking-[0.25em]">
                          *CM-{selectedPass.passCode || 'EVENT'}*
                        </span>
                      </div>

                      {/* Footer Attendee Info */}
                      <div className="pt-4 border-t border-gray-100 dark:border-navy-750/50 text-left grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider text-[8px]">
                            Attendee
                          </p>
                          <p className="font-bold text-gray-800 dark:text-white mt-0.5 truncate">
                            {selectedPass.name || registree.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider text-[8px]">
                            Organization
                          </p>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5 truncate">
                            {selectedPass.organization || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Control Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => window.print()}
                      className="flex-1 rounded-2xl font-bold py-2.5 flex items-center justify-center gap-1.5 text-xs text-gray-700 dark:text-gray-200 border-gray-200 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-950 transition-colors"
                    >
                      <Printer size={13} />
                      <span>Print Ticket</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedPass(null);
                        setCopied(false);
                      }}
                      className="flex-1 rounded-2xl font-bold py-2.5 text-xs bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition-all"
                    >
                      Close Pass
                    </Button>
                  </div>
                </div>
              );
            })()}
        </Modal>
      </div>
    </div>
  );
};
