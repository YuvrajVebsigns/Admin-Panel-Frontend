'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useParams, useRouter } from 'next/navigation';
import { useAttendee, useCheckInAttendee } from '../hooks/useAttendees';
import { AttendeeStatus } from '../types/attendee.types';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import {
  ArrowLeft,
  Mail,
  Phone,
  PhoneCall,
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
  MessageSquare,
  Ticket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useEvent } from '@/modules/events/hooks/useEvents';
import { AttendeePassModal } from './AttendeePassModal';

export const AttendeeDetailsView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const { data: attendee, isLoading, error } = useAttendee(id);
  const checkInMutation = useCheckInAttendee();

  // Pass modal open state
  const [isPassOpen, setIsPassOpen] = useState(false);

  // Extract primary event assigned ID
  const primaryEventId =
    attendee && typeof attendee.eventId === 'object' && attendee.eventId
      ? attendee.eventId.id || (attendee.eventId as { _id?: string })._id || ''
      : (attendee?.eventId as string) || '';

  // Query full event details mapped to this registration
  const { data: fullEvent, isLoading: isEventLoading } = useEvent(primaryEventId || '');

  const formatDateTime = (dateStr?: string | Date, options?: Intl.DateTimeFormatOptions) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString(
        undefined,
        options || {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      );
    } catch {
      return '—';
    }
  };

  const formatDateOnly = (dateStr?: string | Date) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleCheckIn = async (passCode: string, name: string) => {
    try {
      await checkInMutation.mutateAsync(passCode);
      toast.success(`${name || 'Attendee'} has been successfully checked in!`);
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
        width: element.offsetWidth || 380,
        height: element.offsetHeight || 580,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdfWidth = 100; // mm
      const pdfHeight = ((element.offsetHeight || 580) * pdfWidth) / (element.offsetWidth || 380); // mm (exact aspect ratio, 0 margin)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
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

  const getStatusColor = (status?: AttendeeStatus) => {
    switch (status) {
      case AttendeeStatus.CHECKED_IN:
        return 'success';
      case AttendeeStatus.REGISTERED:
        return 'primary';
      case AttendeeStatus.INVITED:
        return 'warning';
      case AttendeeStatus.BLOCKED:
      case AttendeeStatus.REJECTED:
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
  const eventTitle = typeof event === 'object' && event ? event.title || 'Event' : 'Event';
  const eventDate =
    typeof event === 'object' && event && event.startDate ? formatDateOnly(event.startDate) : '';
  const eventLocation =
    typeof event === 'object' && event ? event.location?.address || 'Online Venue' : 'Online Venue';

  const attendeeName = attendee.name || attendee.registrationDetails?.name || 'Attendee';
  const attendeeJobTitle = attendee.jobTitle || attendee.registrationDetails?.jobTitle;
  const attendeeOrg = attendee.organization || attendee.registrationDetails?.organization;
  const attendeeRegType =
    attendee.registrationType || attendee.registrationDetails?.registrationType;
  const attendeeEmail = attendee.email || attendee.registrationDetails?.email || '—';
  const attendeePersonalEmail =
    attendee.personalEmail || attendee.registrationDetails?.personalEmail;
  const attendeeCountryCode =
    attendee.countryCode || attendee.registrationDetails?.countryCode || '';
  const attendeePhone = attendee.phoneNumber || attendee.registrationDetails?.phoneNumber;
  const attendeeLandline = attendee.landlineNumber || attendee.registrationDetails?.landlineNumber;
  const attendeeIndustry =
    attendee.industryVertical || attendee.registrationDetails?.industryVertical;
  const attendeeCity = attendee.city || attendee.registrationDetails?.city;
  const attendeeState = attendee.state || attendee.registrationDetails?.state;
  const attendeeCountry = attendee.country || attendee.registrationDetails?.country;
  const attendeeLocation = [attendeeCity, attendeeState, attendeeCountry]
    .filter(Boolean)
    .join(', ');
  const attendeeMessage = attendee.message || attendee.registrationDetails?.message;
  const attendeeSponsorConsent =
    attendee.sponsorConsent ?? attendee.registrationDetails?.sponsorConsent;
  const attendeeWebsite = attendee.websiteId || attendee.registrationDetails?.websiteId;
  const attendeeRegisteredAt =
    attendee.registeredAt || attendee.registrationDetails?.registeredAt || attendee.createdAt;

  // Dynamic Website & QR Code calculation for print card
  const regDetailWebsite = attendee.registrationDetails?.websiteId;
  const regDetailDomain =
    typeof regDetailWebsite === 'object' && regDetailWebsite && 'domain' in regDetailWebsite
      ? (regDetailWebsite as { domain?: string }).domain
      : undefined;

  const firstFullEventSite =
    typeof fullEvent === 'object' && fullEvent?.websites && fullEvent.websites.length > 0
      ? fullEvent.websites[0]
      : null;
  const firstEventSite =
    typeof event === 'object' && event?.websites && event.websites.length > 0
      ? event.websites[0]
      : null;

  const fullEventSiteDomain =
    typeof firstFullEventSite === 'object' && firstFullEventSite && 'domain' in firstFullEventSite
      ? (firstFullEventSite as { domain?: string }).domain
      : undefined;
  const eventSiteDomain =
    typeof firstEventSite === 'object' && firstEventSite && 'domain' in firstEventSite
      ? (firstEventSite as { domain?: string }).domain
      : undefined;

  const fullEventSiteName =
    typeof firstFullEventSite === 'object' && firstFullEventSite && 'name' in firstFullEventSite
      ? (firstFullEventSite as { name?: string }).name
      : undefined;
  const eventSiteName =
    typeof firstEventSite === 'object' && firstEventSite && 'name' in firstEventSite
      ? (firstEventSite as { name?: string }).name
      : undefined;

  const websiteDomain =
    (typeof attendee.websiteId === 'object' && attendee.websiteId?.domain) ||
    regDetailDomain ||
    fullEventSiteDomain ||
    eventSiteDomain ||
    'core-mediagroup.com';

  const websiteName =
    (typeof attendee.websiteId === 'object' && attendee.websiteId?.name) ||
    (typeof regDetailWebsite === 'object' && regDetailWebsite && 'name' in regDetailWebsite
      ? (regDetailWebsite as { name?: string }).name
      : undefined) ||
    fullEventSiteName ||
    eventSiteName ||
    '';

  const eventSlug =
    (typeof fullEvent === 'object' && fullEvent?.slug) ||
    (typeof event === 'object' && event ? event.slug || '' : '');

  const cleanDomain = String(websiteDomain || 'core-mediagroup.com')
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .trim();
  const cleanSlug = String(eventSlug || '')
    .replace(/^\/+|\/+$/g, '')
    .trim();
  const passCode = attendee.passCode || '';

  const agendaPasscodeUrl = cleanSlug
    ? `https://${cleanDomain}/events/${cleanSlug}/#event-agenda?passcode=${encodeURIComponent(passCode)}`
    : `https://${cleanDomain}/#event-agenda?passcode=${encodeURIComponent(passCode)}`;

  const [printQrDataUrl, setPrintQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!attendee) return;
    if (agendaPasscodeUrl) {
      QRCode.toDataURL(agendaPasscodeUrl, {
        margin: 1,
        width: 400,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      })
        .then((url) => setPrintQrDataUrl(url))
        .catch(() => {
          if (attendee.qrCode && attendee.qrCode.startsWith('data:image')) {
            setPrintQrDataUrl(attendee.qrCode);
          } else {
            setPrintQrDataUrl('');
          }
        });
    } else if (attendee.qrCode && attendee.qrCode.startsWith('data:image')) {
      setPrintQrDataUrl(attendee.qrCode);
    } else {
      setPrintQrDataUrl('');
    }
  }, [attendee, agendaPasscodeUrl]);

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
            attendee.status !== AttendeeStatus.BLOCKED &&
            attendee.status !== AttendeeStatus.REJECTED && (
              <Button
                onClick={() => handleCheckIn(attendee.passCode, attendeeName)}
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
                {attendeeName}
              </h3>
              {attendeeJobTitle && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  {attendeeJobTitle}
                </p>
              )}
              {attendeeOrg && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-700 dark:text-gray-300 font-semibold bg-gray-50 dark:bg-navy-950 px-3 py-1 rounded-full border border-gray-100 dark:border-navy-900">
                  <Building size={12} className="text-brand-500" />
                  <span>{attendeeOrg}</span>
                </div>
              )}
              {attendeeRegType && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {attendeeRegType}
                  </span>
                </div>
              )}

              <div className="mt-4">
                <Badge color={getStatusColor(attendee.status)} variant="light">
                  {String(attendee.status || 'INVITED').replace(/_/g, ' ')}
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
                    Official Email
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                    {attendeeEmail}
                  </p>
                </div>
              </div>

              {attendeePersonalEmail && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <Mail size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Personal Email
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {attendeePersonalEmail}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                  <Phone size={15} className="text-gray-500 dark:text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    Phone Number
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white">
                    {attendeePhone
                      ? `${attendeeCountryCode ? attendeeCountryCode + ' ' : ''}${attendeePhone}`.trim()
                      : '—'}
                  </p>
                </div>
              </div>

              {attendeeLandline && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <PhoneCall size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Landline Number
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">
                      {attendeeLandline}
                    </p>
                  </div>
                </div>
              )}

              {attendeeLocation && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <MapPin size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Location
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {attendeeLocation}
                    </p>
                  </div>
                </div>
              )}

              {attendeeIndustry && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <Building size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Industry Vertical
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {attendeeIndustry}
                    </p>
                  </div>
                </div>
              )}

              {attendeeWebsite && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <Globe size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Origin Website
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {typeof attendeeWebsite === 'object' && attendeeWebsite !== null
                        ? attendeeWebsite.name || attendeeWebsite.domain || 'Website'
                        : String(attendeeWebsite)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                  <Ticket size={15} className="text-gray-500 dark:text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    Pass Code
                  </p>
                  <p className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    {attendee.passCode || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                  <Clock size={15} className="text-gray-500 dark:text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                    Registration Date
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-1">
                    {formatDateTime(attendeeRegisteredAt, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Message / Registration Inquiry Card */}
          {attendeeMessage && (
            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-brand-500" />
                  Registration Message
                </h4>
                {attendeeSponsorConsent && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Sponsor Consent
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-navy-900/60 p-3.5 rounded-2xl border border-gray-100 dark:border-navy-800 whitespace-pre-wrap leading-relaxed">
                {attendeeMessage}
              </p>
            </div>
          )}
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
                        {typeof attendee.checkedInBy === 'object' && attendee.checkedInBy !== null
                          ? `${attendee.checkedInBy.name || 'Admin'} ${attendee.checkedInBy.email ? `(${attendee.checkedInBy.email})` : ''}`.trim()
                          : String(attendee.checkedInBy)}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium">Self / QR Pass Scan</span>
                    )}
                  </p>
                </div>
                {attendee.checkedInAt && (
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Check-in Time
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white mt-1">
                      {formatDateTime(attendee.checkedInAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            attendee.status !== AttendeeStatus.BLOCKED &&
            attendee.status !== AttendeeStatus.REJECTED && (
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
                  onClick={() => handleCheckIn(attendee.passCode, attendeeName)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl text-xs py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  <CheckCircle size={15} />
                  Mark as Checked In
                </Button>
              </div>
            )
          )}{' '}
          {/* Off-screen Ticket Pass for canvas rendering/printing (Full-page Invitation Pass Card) */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <div
              id="print-pass-area"
              className="bg-white text-gray-900 overflow-hidden flex flex-col justify-between items-center w-[380px] h-[580px] text-center"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              {/* Header Banner (Full width edge-to-edge) */}
              <div className="w-full bg-brand-600 px-6 py-5 text-center text-white relative">
                <p className="text-[9.5px] font-extrabold tracking-[0.2em] uppercase text-brand-200">
                  Official Event Admission Pass
                </p>
                <h2 className="text-lg font-extrabold mt-1 tracking-tight text-white leading-tight">
                  {eventTitle}
                </h2>
                {eventDate && (
                  <p className="text-[10.5px] text-brand-100 font-medium mt-1">{eventDate}</p>
                )}
              </div>

              {/* Perforation Divider Line */}
              <div className="w-full border-t-2 border-dashed border-gray-300 relative">
                <div className="absolute -left-3 -top-2.5 h-5 w-5 rounded-full bg-gray-100" />
                <div className="absolute -right-3 -top-2.5 h-5 w-5 rounded-full bg-gray-100" />
              </div>

              {/* Main Card Body */}
              <div className="w-full px-6 flex-1 flex flex-col items-center justify-center py-3">
                {/* QR Code Container */}
                <div className="h-40 w-40 border border-gray-200 rounded-2xl bg-white p-2.5 shadow-sm flex items-center justify-center">
                  {printQrDataUrl || attendee.qrCode ? (
                    <img
                      src={printQrDataUrl || attendee.qrCode}
                      alt="Event Pass QR Code"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">QR Code unavailable</div>
                  )}
                </div>

                {/* Attendee Info */}
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">{attendeeName}</h3>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{attendeeEmail}</p>
                  {(attendeeOrg || attendeeJobTitle) && (
                    <div className="inline-block mt-1.5 text-xs text-brand-700 font-bold bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
                      {[attendeeJobTitle, attendeeOrg].filter(Boolean).join(' • ')}
                    </div>
                  )}
                </div>

                {/* Date & Location Details Box */}
                <div className="w-full mt-3 bg-gray-50 rounded-xl p-3 space-y-1.5 text-left border border-gray-200 text-xs">
                  {eventDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold w-20 shrink-0">
                        Date & Time:
                      </span>
                      <span className="font-semibold text-gray-800 truncate">{eventDate}</span>
                    </div>
                  )}
                  {eventLocation && (
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold w-20 shrink-0">
                        Venue:
                      </span>
                      <span className="font-semibold text-gray-800 line-clamp-2">
                        {eventLocation}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Passcode & Barcode / Branding */}
              <div className="w-full px-6 pb-4 pt-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center gap-1">
                  <div className="h-6 w-48 bg-[repeating-linear-gradient(90deg,#374151,#374151_2px,transparent_2px,transparent_6px)] opacity-70 rounded" />
                  <span className="text-[11px] font-mono tracking-[0.25em] text-gray-800 font-bold uppercase bg-gray-100 px-3 py-0.5 rounded border border-gray-200">
                    PASS-{passCode || 'VERIFIED'}
                  </span>
                </div>
                <p className="text-[8.5px] font-extrabold tracking-[0.15em] text-brand-600 uppercase mt-2">
                  {websiteName
                    ? websiteName.toUpperCase()
                    : cleanDomain
                      ? cleanDomain.toUpperCase()
                      : 'CORE MEDIA GROUP'}
                </p>
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
                  {fullEvent.type && (
                    <Badge
                      color={fullEvent.type === 'ONLINE' ? 'success' : 'primary'}
                      variant="light"
                    >
                      {fullEvent.type}
                    </Badge>
                  )}
                  {fullEvent.status && (
                    <Badge
                      color={fullEvent.status === 'ON_GOING' ? 'success' : 'primary'}
                      variant="light"
                    >
                      {String(fullEvent.status).replace(/_/g, ' ')}
                    </Badge>
                  )}
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
                  <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-gray-150 dark:border-navy-755">
                    <img
                      src={fullEvent.bannerImage.original}
                      alt={fullEvent.title || 'Event Banner'}
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
                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2 font-medium">
                      <p>
                        <span className="text-gray-400">Start:</span>{' '}
                        {formatDateTime(fullEvent.startDate)}
                      </p>
                      <p>
                        <span className="text-gray-400">End:</span>{' '}
                        {formatDateTime(fullEvent.endDate)}
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
                        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1 font-medium">
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
