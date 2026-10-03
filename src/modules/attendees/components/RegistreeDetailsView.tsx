'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useParams, useRouter } from 'next/navigation';
import {
  useRegistree,
  useApproveRegistration,
  useRejectRegistration,
  useBlockRegistration,
} from '../hooks/useRegistrees';
import { RegistreeHistoryItem, RegistreeEvent } from '../types/registree.types';
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
  Users,
  Globe,
  MapPin,
  MessageSquare,
  Eye,
  Ticket,
  Copy,
  Check,
  Printer,
  Download,
  ExternalLink,
  X,
  Ban,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import toast from 'react-hot-toast';

export const RegistreeDetailsView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: registree, isLoading, error } = useRegistree(id);

  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();
  const blockMutation = useBlockRegistration();

  const handleApprove = async (eventId: string) => {
    if (confirm('Are you sure you want to approve this registration?')) {
      try {
        await approveMutation.mutateAsync({ id, eventId });
        toast.success('Registration approved successfully');
      } catch (err) {
        const error = err as { message?: string };
        toast.error(error.message || 'Failed to approve registration');
      }
    }
  };

  const handleReject = async (eventId: string) => {
    if (confirm('Are you sure you want to reject this registration?')) {
      try {
        await rejectMutation.mutateAsync({ id, eventId });
        toast.success('Registration rejected successfully');
      } catch (err) {
        const error = err as { message?: string };
        toast.error(error.message || 'Failed to reject registration');
      }
    }
  };

  const handleBlock = async (eventId: string) => {
    if (
      confirm(
        'Are you sure you want to block this registration? Blocked users cannot register for future events.',
      )
    ) {
      try {
        await blockMutation.mutateAsync({ id, eventId });
        toast.success('Registration blocked successfully');
      } catch (err) {
        const error = err as { message?: string };
        toast.error(error.message || 'Failed to block registration');
      }
    }
  };

  // Pass and message modal states
  const [selectedPass, setSelectedPass] = useState<RegistreeHistoryItem | null>(null);
  const [passQrDataUrl, setPassQrDataUrl] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<{
    title: string;
    message: string;
    sponsorConsent?: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!selectedPass) {
      setPassQrDataUrl('');
      return;
    }

    const passEvent = getMatchEvent(selectedPass);
    const passWebsiteDomain =
      (typeof selectedPass.websiteId === 'object' &&
        'domain' in selectedPass.websiteId &&
        selectedPass.websiteId.domain) ||
      (typeof registree?.websiteId === 'object' &&
        'domain' in registree.websiteId &&
        registree.websiteId.domain) ||
      (passEvent?.websites &&
        passEvent.websites.length > 0 &&
        typeof passEvent.websites[0] === 'object' &&
        'domain' in passEvent.websites[0] &&
        (passEvent.websites[0] as { domain?: string }).domain) ||
      'core-mediagroup.com';
    const passEventSlug = passEvent?.slug || '';
    const cleanPassDomain = String(passWebsiteDomain)
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '')
      .trim();
    const cleanPassSlug = String(passEventSlug)
      .replace(/^\/+|\/+$/g, '')
      .trim();
    const rawPassCode = selectedPass.passCode || '';
    const agendaPasscodeUrl = cleanPassSlug
      ? `https://${cleanPassDomain}/events/${cleanPassSlug}/#event-agenda?passcode=${encodeURIComponent(rawPassCode)}`
      : `https://${cleanPassDomain}/#event-agenda?passcode=${encodeURIComponent(rawPassCode)}`;

    if (agendaPasscodeUrl) {
      QRCode.toDataURL(agendaPasscodeUrl, {
        margin: 1,
        width: 350,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      })
        .then((url) => setPassQrDataUrl(url))
        .catch(() => {
          if (selectedPass.qrCode && selectedPass.qrCode.startsWith('data:image')) {
            setPassQrDataUrl(selectedPass.qrCode);
          } else {
            setPassQrDataUrl('');
          }
        });
    } else if (selectedPass.qrCode && selectedPass.qrCode.startsWith('data:image')) {
      setPassQrDataUrl(selectedPass.qrCode);
    } else {
      setPassQrDataUrl('');
    }
  }, [selectedPass, registree]);

  // Safe date formatters
  const formatDate = (dateStr?: string | Date, options?: Intl.DateTimeFormatOptions) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(
        undefined,
        options || {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        },
      );
    } catch {
      return '—';
    }
  };

  const formatDateTime = (dateStr?: string | Date) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  // Pagination for history
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 5;

  const eventIds: RegistreeEvent[] = Array.isArray(registree?.eventIds)
    ? registree.eventIds.filter((ev): ev is RegistreeEvent =>
        Boolean(ev && (ev.id || ev._id || ev.title)),
      )
    : [];

  const history: RegistreeHistoryItem[] = Array.isArray(registree?.history)
    ? registree.history.filter((h): h is RegistreeHistoryItem => Boolean(h))
    : [];

  // Paginate history locally since registree detail returns all history
  const totalHistoryItems = history.length;
  const totalHistoryPages = Math.max(1, Math.ceil(totalHistoryItems / historyLimit));
  const paginatedHistory = history.slice(
    (historyPage - 1) * historyLimit,
    historyPage * historyLimit,
  );

  // Stats
  const stats = React.useMemo(() => {
    if (!history.length) return { total: 0, attended: 0, rate: 0 };
    const total = history.length;
    const attended = history.filter((h) => Boolean(h?.attended)).length;
    const rate = Math.round((attended / total) * 100);
    return { total, attended, rate };
  }, [history]);

  // Safe event lookup
  const getMatchEvent = (item?: RegistreeHistoryItem | null): RegistreeEvent | undefined => {
    if (!item) return undefined;
    if (
      item.event &&
      typeof item.event === 'object' &&
      (item.event.id || item.event._id || item.event.title)
    ) {
      return item.event;
    }
    const targetEventId =
      item.eventId?.toString() ||
      item.event?._id?.toString() ||
      item._id?.toString() ||
      item.id?.toString();
    if (!targetEventId) return undefined;
    return eventIds.find((ev) => {
      const evId = ev?.id || ev?._id;
      return evId && evId.toString() === targetEventId;
    });
  };

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
                <User size={36} className="text-gray-400 dark:text-navy-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                {registree.name || 'Unnamed Contact'}
              </h3>
              {registree.jobTitle && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  {registree.jobTitle}
                </p>
              )}
              {registree.organization && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-700 dark:text-gray-300 font-semibold bg-gray-50 dark:bg-navy-950 px-3 py-1 rounded-full border border-gray-100 dark:border-navy-900">
                  <Building size={12} className="text-brand-500" />
                  <span>{registree.organization}</span>
                </div>
              )}
              {registree.registrationType && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {registree.registrationType}
                  </span>
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
                    Official Email
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                    {registree.email}
                  </p>
                </div>
              </div>

              {registree.personalEmail && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <Mail size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Personal Email
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {registree.personalEmail}
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
                    {registree.phoneNumber
                      ? `${registree.countryCode || ''} ${registree.phoneNumber}`.trim()
                      : '—'}
                  </p>
                </div>
              </div>

              {registree.landlineNumber && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <PhoneCall size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Landline Number
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">
                      {registree.landlineNumber}
                    </p>
                  </div>
                </div>
              )}

              {(registree.city || registree.state || registree.country) && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <MapPin size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Location
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {[registree.city, registree.state, registree.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {registree.industryVertical && (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center shrink-0 border border-gray-100 dark:border-navy-900">
                    <Building size={15} className="text-gray-500 dark:text-navy-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                      Industry Vertical
                    </p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {registree.industryVertical}
                    </p>
                  </div>
                </div>
              )}

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
                      {typeof registree.websiteId === 'object' && registree.websiteId !== null
                        ? registree.websiteId.name || registree.websiteId.domain || 'Website'
                        : String(registree.websiteId)}
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
                    Registration Date
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-1">
                    {formatDate(registree.registeredAt || registree.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Message / Inquiry Card */}
          {(registree.message || registree.latestRegistration?.message) && (
            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-brand-500" />
                  Registration Message
                </h4>
                {(registree.sponsorConsent || registree.latestRegistration?.sponsorConsent) && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Sponsor Consent
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-navy-900/60 p-3.5 rounded-2xl border border-gray-100 dark:border-navy-800 whitespace-pre-wrap leading-relaxed">
                {registree.message || registree.latestRegistration?.message}
              </p>
            </div>
          )}

          {/* Events Sidebar */}
          {eventIds.length > 0 && (
            <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-3xl p-6 shadow-theme-xs">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                Registered Events ({eventIds.length})
              </h4>
              <div className="space-y-3">
                {eventIds.map((ev: RegistreeEvent, idx: number) => {
                  const evId = ev?.id || ev?._id || `ev-${idx}`;
                  return (
                    <div
                      key={evId}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-800"
                    >
                      <div className="h-8 w-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1">
                          {ev?.title || 'Event'}
                        </p>
                        {ev?.type && (
                          <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">
                            {ev.type}
                          </span>
                        )}
                        <p className="text-[10px] text-gray-400 dark:text-navy-400 mt-0.5">
                          {formatDate(ev?.startDate)}
                        </p>
                      </div>
                      {ev?.status && (
                        <Badge
                          color={ev.status === 'ACTIVE' ? 'success' : 'warning'}
                          variant="light"
                        >
                          {ev.status}
                        </Badge>
                      )}
                    </div>
                  );
                })}
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
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Opportunity / Type</th>
                        <th className="py-3.5 px-4">Pass Code</th>
                        <th className="py-3.5 px-4">Organization & Designation</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Contact</th>
                        <th className="py-3.5 px-4 text-center">Inquiry Note</th>
                        <th className="py-3.5 px-4">Attended</th>
                        <th className="py-3.5 px-4 text-center">Actions</th>
                        <th className="py-3.5 pl-4 text-right">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-navy-850/50 text-xs">
                      {paginatedHistory.map((item: RegistreeHistoryItem, idx: number) => {
                        const matchEvent = getMatchEvent(item);
                        const matchEventId =
                          matchEvent?.id ||
                          matchEvent?._id ||
                          item?.eventId?.toString() ||
                          item?.event?._id?.toString() ||
                          item?.event?.id?.toString();

                        const itemCity = item?.city || registree.city;
                        const itemState = item?.state || registree.state;
                        const itemCountry = item?.country || registree.country;
                        const itemLoc = [itemCity, itemState, itemCountry]
                          .filter(Boolean)
                          .join(', ');

                        const itemPhone = item?.phoneNumber || registree.phoneNumber;
                        const itemCountryCode = item?.countryCode || registree.countryCode || '';
                        const itemLandline = item?.landlineNumber || registree.landlineNumber;
                        const itemOfficialEmail = item?.email || registree.email;
                        const itemPersonalEmail = item?.personalEmail || registree.personalEmail;

                        const itemMessage =
                          item?.message || (idx === 0 ? registree.message : undefined);
                        const itemConsent =
                          item?.sponsorConsent ??
                          (idx === 0 ? registree.sponsorConsent : undefined);

                        return (
                          <tr
                            key={`${item?.passCode || item?.id || item?._id || idx}`}
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
                            <td className="py-4 px-4">
                              <Badge
                                color={
                                  item?.status === 'APPROVED'
                                    ? 'success'
                                    : item?.status === 'PENDING'
                                      ? 'warning'
                                      : item?.status === 'REJECTED'
                                        ? 'error'
                                        : 'dark'
                                }
                                variant="light"
                              >
                                {item?.status || 'PENDING'}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 whitespace-nowrap">
                                {item?.registrationType ||
                                  registree.registrationType ||
                                  'CIO Delegate'}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono font-bold text-gray-600 dark:text-navy-300 whitespace-nowrap">
                              {item?.passCode || '—'}
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-gray-800 dark:text-gray-200 font-bold">
                                {item?.organization || registree?.organization || '—'}
                              </p>
                              {(item?.jobTitle || registree?.jobTitle) && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                  {item?.jobTitle || registree?.jobTitle}
                                </p>
                              )}
                              {(item?.industryVertical || registree?.industryVertical) && (
                                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                                  {item?.industryVertical || registree?.industryVertical}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className="text-gray-600 dark:text-gray-300 block truncate max-w-[120px]"
                                title={itemLoc || '—'}
                              >
                                {itemLoc || '—'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="min-w-[120px]">
                                <span
                                  className="text-gray-800 dark:text-gray-200 block truncate"
                                  title={itemOfficialEmail}
                                >
                                  {itemOfficialEmail}
                                </span>
                                {itemPersonalEmail && (
                                  <span
                                    className="text-[10px] text-gray-400 dark:text-navy-400 block truncate"
                                    title={`Personal: ${itemPersonalEmail}`}
                                  >
                                    {itemPersonalEmail}
                                  </span>
                                )}
                                {itemPhone && (
                                  <span className="text-[11px] text-gray-600 dark:text-gray-400 block truncate">
                                    {`${itemCountryCode ? itemCountryCode + ' ' : ''}${itemPhone}`.trim()}
                                  </span>
                                )}
                                {itemLandline && (
                                  <span className="text-[10px] text-gray-400 dark:text-navy-400 block truncate">
                                    Landline: {itemLandline}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {itemMessage ? (
                                <button
                                  onClick={() =>
                                    setSelectedMessage({
                                      title: matchEvent?.title
                                        ? `Registration Message - ${matchEvent.title}`
                                        : 'Registration Message',
                                      message: itemMessage,
                                      sponsorConsent: itemConsent,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-navy-900/60 dark:hover:bg-navy-800 dark:text-brand-400 transition-colors text-[11px] font-semibold"
                                  title="View Registration Message"
                                >
                                  <MessageSquare size={13} />
                                  <span>View Note</span>
                                </button>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {item?.attended ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit whitespace-nowrap">
                                  <CheckCircle size={12} />
                                  <span className="text-[10px] uppercase">Yes</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full w-fit whitespace-nowrap">
                                  <Clock size={12} />
                                  <span className="text-[10px] uppercase">No</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {matchEventId && (
                                  <button
                                    onClick={() => router.push(`/events/${matchEventId}/view`)}
                                    className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-brand-500/10 text-gray-500 hover:text-brand-500 flex items-center justify-center border border-gray-100 dark:bg-navy-900/50 dark:border-navy-800 transition-colors"
                                    title="View Event Details"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                                {(item?.status === 'APPROVED' || !item?.status) && item?.qrCode && (
                                  <button
                                    onClick={() => setSelectedPass(item)}
                                    className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-500 flex items-center justify-center border border-gray-100 dark:bg-navy-900/50 dark:border-navy-800 transition-colors"
                                    title="View Generated Pass"
                                  >
                                    <Ticket size={14} />
                                  </button>
                                )}
                                {matchEventId &&
                                  (item?.status === 'PENDING' ||
                                    item?.status === 'REJECTED' ||
                                    item?.status === 'BLOCKED') && (
                                    <button
                                      onClick={() => handleApprove(matchEventId)}
                                      disabled={approveMutation.isPending}
                                      className="h-8 w-8 rounded-lg bg-emerald-50 hover:bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:bg-navy-900/50 dark:border-navy-800 transition-colors"
                                      title="Approve Registration"
                                    >
                                      <Check size={14} />
                                    </button>
                                  )}
                                {matchEventId && item?.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleReject(matchEventId)}
                                    disabled={rejectMutation.isPending}
                                    className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-500/15 text-rose-600 flex items-center justify-center border border-rose-100 dark:bg-navy-900/50 dark:border-navy-800 transition-colors"
                                    title="Reject Registration"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                                {matchEventId && item?.status !== 'BLOCKED' && (
                                  <button
                                    onClick={() => handleBlock(matchEventId)}
                                    disabled={blockMutation.isPending}
                                    className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-red-500/10 text-red-500 flex items-center justify-center border border-gray-100 dark:bg-navy-900/50 dark:border-navy-800 transition-colors"
                                    title="Block Registration"
                                  >
                                    <Ban size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 pl-4 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {formatDate(item?.savedAt || item?.registeredAt)}
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
              const passEvent = getMatchEvent(selectedPass);
              const passWebsiteDomain =
                (typeof selectedPass.websiteId === 'object' &&
                  'domain' in selectedPass.websiteId &&
                  selectedPass.websiteId.domain) ||
                (typeof registree?.websiteId === 'object' &&
                  'domain' in registree.websiteId &&
                  registree.websiteId.domain) ||
                (passEvent?.websites &&
                  passEvent.websites.length > 0 &&
                  typeof passEvent.websites[0] === 'object' &&
                  'domain' in passEvent.websites[0] &&
                  (passEvent.websites[0] as { domain?: string }).domain) ||
                'core-mediagroup.com';
              const passEventSlug = passEvent?.slug || '';
              const cleanPassDomain = String(passWebsiteDomain)
                .replace(/^https?:\/\//i, '')
                .replace(/\/+$/, '')
                .trim();
              const cleanPassSlug = String(passEventSlug)
                .replace(/^\/+|\/+$/g, '')
                .trim();
              const rawPassCode = selectedPass.passCode || '';
              const agendaPasscodeUrl = cleanPassSlug
                ? `https://${cleanPassDomain}/events/${cleanPassSlug}/#event-agenda?passcode=${encodeURIComponent(rawPassCode)}`
                : `https://${cleanPassDomain}/#event-agenda?passcode=${encodeURIComponent(rawPassCode)}`;

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
                              {formatDateTime(passEvent.startDate)}
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
                        {passQrDataUrl || selectedPass.qrCode ? (
                          <img
                            src={passQrDataUrl || selectedPass.qrCode}
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

                      {/* Dynamic Agenda Passcode Link */}
                      <div className="bg-indigo-50/70 dark:bg-navy-900/80 rounded-xl p-2.5 border border-indigo-100 dark:border-navy-700 text-left space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                            <Globe size={11} /> Dynamic Agenda Pass Link
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(agendaPasscodeUrl);
                                toast.success('Agenda link copied to clipboard');
                              }}
                              className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-white dark:hover:bg-navy-800 transition-colors"
                              title="Copy Agenda Link"
                            >
                              <Copy size={12} />
                            </button>
                            <a
                              href={agendaPasscodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-white dark:hover:bg-navy-800 transition-colors"
                              title="Open Agenda Link"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                        <p className="text-[10px] font-mono text-gray-600 dark:text-gray-300 truncate">
                          {agendaPasscodeUrl}
                        </p>
                      </div>

                      {/* Footer Attendee Info */}
                      <div className="pt-4 border-t border-gray-100 dark:border-navy-750/50 text-left grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider text-[8px]">
                            Attendee
                          </p>
                          <p className="font-bold text-gray-800 dark:text-white mt-0.5 truncate">
                            {selectedPass.name || registree.name || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase tracking-wider text-[8px]">
                            Organization
                          </p>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5 truncate">
                            {selectedPass.organization || registree.organization || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Control Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    {selectedPass.qrCode && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = selectedPass.qrCode!;
                          link.download = `${(selectedPass.name || registree.name || 'Attendee').replace(/\s+/g, '_')}_Pass_QR.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          toast.success('QR Code downloaded');
                        }}
                        className="flex-1 rounded-2xl font-bold py-2.5 flex items-center justify-center gap-1.5 text-xs text-gray-700 dark:text-gray-200 border-gray-200 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-950 transition-colors"
                      >
                        <Download size={13} />
                        <span>Download QR</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => window.print()}
                      className="flex-1 rounded-2xl font-bold py-2.5 flex items-center justify-center gap-1.5 text-xs text-gray-700 dark:text-gray-200 border-gray-200 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-950 transition-colors"
                    >
                      <Printer size={13} />
                      <span>Print Pass</span>
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

        {/* Registration Message Modal */}
        <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)} size="md">
          {selectedMessage && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-700 pb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="text-brand-500" size={17} />
                  {selectedMessage.title}
                </h3>
                {selectedMessage.sponsorConsent && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Sponsor Consent
                  </span>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-navy-900/60 p-4 rounded-2xl border border-gray-100 dark:border-navy-800 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setSelectedMessage(null)}
                  variant="outline"
                  className="rounded-xl text-xs py-2"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
