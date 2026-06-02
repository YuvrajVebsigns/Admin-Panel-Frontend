'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAttendee, useCheckInAttendee } from '../hooks/useAttendees';
import { AttendeeStatus } from '../types/attendee.types';
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
  MapPin,
  Globe,
  Eye,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useEvent } from '@/modules/events/hooks/useEvents';
import { AttendeePassModal } from './AttendeePassModal';

export const AttendeeDetailsView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: attendee, isLoading, error } = useAttendee(id);
  const checkInMutation = useCheckInAttendee();

  // Pass modal open state
  const [isPassOpen, setIsPassOpen] = useState(false);

  // Extract primary event assigned ID
  const primaryEventId =
    attendee && typeof attendee.eventId === 'object' && attendee.eventId
      ? attendee.eventId.id
      : (attendee?.eventId as string);

  // Query full event details mapped to this registration
  const { data: fullEvent, isLoading: isEventLoading } = useEvent(primaryEventId || '');

  const handleCheckIn = async (passCode: string, name: string) => {
    try {
      await checkInMutation.mutateAsync(passCode);
      toast.success(`${name} has been successfully checked in!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to check in attendee');
    }
  };

  const generatePdfAndPrint = async () => {
    const element = document.getElementById('print-pass-area');
    if (!element) {
      toast.error('Pass ticket template element not found');
      return;
    }

    const loadingToast = toast.loading('Generating ticket PDF...');

    try {
      // Small timeout to allow styling painting
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 3, // High scale for clear text and barcodes
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [90, 140], // standard pocket wallet ticket format
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 90, 140);
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      // Open in a new tab for native printing
      const newTab = window.open(blobUrl, '_blank');
      if (newTab) {
        toast.success('Pass opened in new tab for printing', { id: loadingToast });
      } else {
        toast.error('Pop-up blocked. Please enable popups for this site.', { id: loadingToast });
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to print PDF', { id: loadingToast });
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
        <Button variant="outline" onClick={() => router.push('/attendance')} className="mt-4">
          Return to Console
        </Button>
      </div>
    );
  }

  const event = attendee.eventId;
  const eventTitle = typeof event === 'object' && event ? event.title : 'Event';
  const eventDate =
    typeof event === 'object' && event
      ? new Date(event.startDate).toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
  const eventLocation =
    typeof event === 'object' && event ? event.location?.address || 'Online Venue' : 'Online Venue';

  return (
    <div className="space-y-6">
      {/* Top action header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-800 pb-4 mb-4">
        <button
          onClick={() => router.push('/attendance')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Attendance
        </button>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsPassOpen(true)}
            variant="outline"
            className="flex items-center gap-2 rounded-xl text-xs py-2"
          >
            <Eye size={15} />
            View Pass
          </Button>
          <Button
            onClick={generatePdfAndPrint}
            className="flex items-center gap-2 rounded-xl text-xs py-2 bg-gradient-to-r from-brand-500 to-indigo-500 border-none hover:opacity-95"
          >
            <Printer size={15} />
            Print Pass (PDF)
          </Button>
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
        {/* Left Column: Attendee Card Details & Ticket preview */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card: Profile Identity */}
          <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs relative overflow-hidden">
            {/* Header Glassmorphism Accent */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 to-indigo-500" />

            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50 flex items-center justify-center text-gray-500 shadow-md mb-4">
                <User size={36} className="text-gray-400 dark:text-navy-500" />
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
                    {attendee.phoneNumber || '—'}
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
          {/* Card: On Desk Check-in Log / Action */}
          {attendee.status === AttendeeStatus.CHECKED_IN ? (
            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={18} />
                On Desk Check-in
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    Checked In By
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white mt-1">
                    {attendee.checkedInBy ? (
                      <span>
                        {attendee.checkedInBy.name} ({attendee.checkedInBy.email})
                      </span>
                    ) : (
                      <span className="text-gray-505 font-medium">Self / QR Pass Scan</span>
                    )}
                  </p>
                </div>
                {attendee.checkedInAt && (
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Check-in Time
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white mt-1">
                      {new Date(attendee.checkedInAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            attendee.status !== AttendeeStatus.BLOCKED && (
              <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs relative overflow-hidden space-y-4">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-500" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="text-brand-500" size={18} />
                  On Desk Check-in
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mark this attendee as checked in at the physical reception desk. This will record
                  your admin details in the audit log.
                </p>
                <Button
                  onClick={() => handleCheckIn(attendee.passCode, attendee.name)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl text-xs py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  <CheckCircle size={15} />
                  Mark as Checked In
                </Button>
              </div>
            )
          )}{' '}
          {/* Off-screen Ticket Pass for canvas rendering/printing */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <div
              id="print-pass-area"
              className="bg-white text-gray-900 border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col items-center p-5 max-w-[280px] w-[280px] text-center"
              style={{ fontFamily: 'sans-serif' }}
            >
              <div className="w-full bg-brand-600 p-4 text-center text-white rounded-t-lg relative">
                <h4 className="text-[9px] font-bold tracking-widest uppercase text-brand-200">
                  Official Event Pass
                </h4>
                <h2 className="text-sm font-extrabold mt-1 line-clamp-1">{eventTitle}</h2>
              </div>

              <div className="w-full border-t-2 border-dashed border-gray-200 my-4" />

              <div className="w-full flex flex-col items-center">
                <div className="relative h-28 w-28 border border-gray-200 rounded-lg bg-gray-50 p-2 flex items-center justify-center">
                  {attendee.qrCode ? (
                    <img
                      src={attendee.qrCode}
                      alt="QR Code"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-[10px]">QR Code unavailable</div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-gray-900">{attendee.name}</h3>
                  <p className="text-[10px] font-medium text-gray-505 mt-0.5">{attendee.email}</p>
                  {attendee.organization && (
                    <div className="inline-block mt-1 text-[10px] text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-full">
                      {attendee.organization}
                    </div>
                  )}
                </div>

                <div className="w-full mt-4 bg-gray-50 rounded-xl p-3 space-y-2 text-left border border-gray-150 text-[11px]">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">
                      Date & Time
                    </p>
                    <p className="font-semibold text-gray-700">{eventDate || 'Scheduled Event'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">
                      Venue Address
                    </p>
                    <p className="font-semibold text-gray-700 line-clamp-2">{eventLocation}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-center gap-1 w-full">
                  <div className="h-8 w-full bg-[repeating-linear-gradient(90deg,#9ca3af,#9ca3af_2px,transparent_2px,transparent_6px)] opacity-60 rounded" />
                  <span className="text-[8px] font-mono tracking-widest text-gray-505 font-bold uppercase">
                    PASS-{attendee.passCode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Current Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-700 pb-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Current Event Assignment
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Details of the event mapped to this registration
                </p>
              </div>
              {fullEvent && (
                <div className="flex items-center gap-2">
                  <Badge
                    color={fullEvent.type === 'ONLINE' ? 'success' : 'primary'}
                    variant="light"
                  >
                    {fullEvent.type}
                  </Badge>
                  <Badge
                    color={fullEvent.status === 'ON_GOING' ? 'success' : 'primary'}
                    variant="light"
                  >
                    {fullEvent.status.replace('_', ' ')}
                  </Badge>
                </div>
              )}
            </div>

            {isEventLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                <p className="text-xs text-gray-400">Loading event information...</p>
              </div>
            ) : !fullEvent ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-150 dark:border-navy-700 rounded-2xl">
                <AlertCircle size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-navy-450 font-medium">
                  Event details unavailable or deleted.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Event Banner */}
                {fullEvent.bannerImage?.original && (
                  <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-gray-150 dark:border-navy-750">
                    <img
                      src={fullEvent.bannerImage.original}
                      alt={fullEvent.title}
                      className="object-cover w-full h-full hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Event Title */}
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-snug">
                    {fullEvent.title}
                  </h2>
                  {fullEvent.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed font-medium">
                      {fullEvent.excerpt}
                    </p>
                  )}
                </div>

                {/* Logistics Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date/Time Block */}
                  <div className="bg-gray-50 dark:bg-navy-950/40 border border-gray-100 dark:border-navy-900 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-brand-500">
                      <Calendar size={16} />
                      <span className="text-[10px] uppercase font-extrabold tracking-wider">
                        Date & Time
                      </span>
                    </div>
                    <div className="text-xs text-gray-705 dark:text-gray-300 space-y-2 font-medium">
                      <p>
                        <span className="text-gray-400">Start:</span>{' '}
                        {new Date(fullEvent.startDate).toLocaleString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p>
                        <span className="text-gray-400">End:</span>{' '}
                        {new Date(fullEvent.endDate).toLocaleString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Venue / Meeting Block */}
                  <div className="bg-gray-50 dark:bg-navy-950/40 border border-gray-100 dark:border-navy-900 rounded-2xl p-5 space-y-3">
                    {fullEvent.type === 'ONLINE' ? (
                      <>
                        <div className="flex items-center gap-2 text-emerald-500">
                          <Globe size={16} />
                          <span className="text-[10px] uppercase font-extrabold tracking-wider">
                            Online Event Access
                          </span>
                        </div>
                        <div className="text-xs font-medium">
                          {fullEvent.meetingLink ? (
                            <div className="space-y-2">
                              <p className="text-gray-400">Meeting Link:</p>
                              <a
                                href={fullEvent.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-500 hover:text-brand-600 hover:underline font-bold break-all block"
                              >
                                {fullEvent.meetingLink}
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400">No meeting link provided</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-indigo-500">
                          <MapPin size={16} />
                          <span className="text-[10px] uppercase font-extrabold tracking-wider">
                            Location Venue
                          </span>
                        </div>
                        <div className="text-xs text-gray-705 dark:text-gray-300 space-y-1 font-medium">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {fullEvent.location?.city || 'Venue'}
                          </p>
                          <p className="text-gray-400 line-clamp-2">
                            {fullEvent.location?.address || 'No venue address specified'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description content */}
                {fullEvent.description && (
                  <div className="border-t border-gray-100 dark:border-navy-700 pt-6">
                    <h5 className="text-[10px] uppercase font-extrabold tracking-wider text-gray-450 dark:text-gray-500 mb-3">
                      Event Summary
                    </h5>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {typeof fullEvent.description === 'string' ? (
                        <p className="whitespace-pre-wrap">{fullEvent.description}</p>
                      ) : (
                        <p>
                          {fullEvent.excerpt ||
                            'Event description is available inside the main event manager.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Pass Modal */}
      {isPassOpen && (
        <AttendeePassModal
          isOpen={isPassOpen}
          onClose={() => setIsPassOpen(false)}
          attendee={attendee}
          onPrint={generatePdfAndPrint}
        />
      )}
    </div>
  );
};
