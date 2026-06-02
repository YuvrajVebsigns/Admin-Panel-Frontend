'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSponsor } from '@/modules/sponsors/hooks/useSponsors';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { useEventAttendees } from '@/modules/attendees/hooks/useAttendees';
import { AttendeeStatus } from '@/modules/attendees/types/attendee.types';
import { SponsorType, SponsorTier } from '@/modules/sponsors/types/sponsor.types';
import { getImageUrl } from '@/lib/utils';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Image from 'next/image';
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Globe,
  Building2,
  User,
  Award,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

// Subcomponent to fetch and render attendees for an event
const EventAttendeesList: React.FC<{
  eventId: string;
  onAttendeesLoaded: (count: number, metCount: number) => void;
}> = ({ eventId, onAttendeesLoaded }) => {
  const { data: attendees, isLoading, error } = useEventAttendees(eventId);

  React.useEffect(() => {
    if (attendees) {
      const met = attendees.filter((a) => a.status === AttendeeStatus.CHECKED_IN).length;
      onAttendeesLoaded(attendees.length, met);
    }
  }, [attendees, onAttendeesLoaded]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-navy-400 py-4 justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
        <span>Loading visitors met...</span>
      </div>
    );
  }

  if (error || !attendees || attendees.length === 0) {
    return (
      <div className="text-xs text-gray-400 dark:text-navy-500 py-8 text-center italic bg-gray-50/50 dark:bg-navy-950/10 rounded-2xl border border-dashed border-gray-100 dark:border-navy-800">
        No visitors registered or met at this event yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-100 dark:border-navy-800 rounded-2xl bg-white dark:bg-navy-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-navy-800 bg-gray-50/70 dark:bg-navy-950/50 text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
              <th className="py-3 px-4">Visitor Name</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4">Interaction Status</th>
              <th className="py-3 px-4">Met / Check-in Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-navy-850/50 text-xs">
            {attendees.map((attendee) => (
              <tr
                key={attendee.id}
                className="hover:bg-gray-50/50 dark:hover:bg-navy-950/20 transition-all"
              >
                <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-white">
                  {attendee.name}
                </td>
                <td className="py-3.5 px-4 text-gray-600 dark:text-navy-300">{attendee.email}</td>
                <td className="py-3.5 px-4 text-gray-500 dark:text-navy-500">
                  {attendee.phoneNumber || '—'}
                </td>
                <td className="py-3.5 px-4">
                  <Badge
                    color={
                      attendee.status === AttendeeStatus.CHECKED_IN
                        ? 'success'
                        : attendee.status === AttendeeStatus.REGISTERED
                          ? 'info'
                          : attendee.status === AttendeeStatus.BLOCKED
                            ? 'error'
                            : 'light'
                    }
                    className="font-bold text-[9px] uppercase px-2 py-0.5 rounded-md border-none shadow-sm"
                  >
                    {attendee.status === AttendeeStatus.CHECKED_IN
                      ? 'MET & CHECKED IN'
                      : attendee.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-gray-400 dark:text-navy-500 font-medium">
                  {attendee.checkedInAt ? (
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-success-500" />
                      <span>
                        {new Date(attendee.checkedInAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-300 dark:text-navy-700">
                      Scheduled / No check-in
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SponsorDetailsView: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const sponsorId = params.id as string;

  const { data: sponsor, isLoading: isSponsorLoading } = useSponsor(sponsorId);
  const { events, isLoading: isEventsLoading } = useEvents();

  // Expanded events state
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Dynamic attendees caching to aggregate totals for stats cards
  const [attendeeCounts, setAttendeeCounts] = useState<
    Record<string, { total: number; met: number }>
  >({});

  const handleAttendeesLoaded = React.useCallback((eventId: string, total: number, met: number) => {
    setAttendeeCounts((prev) => {
      if (prev[eventId]?.total === total && prev[eventId]?.met === met) return prev;
      return { ...prev, [eventId]: { total, met } };
    });
  }, []);

  if (isSponsorLoading || isEventsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Loading sponsor insights...
        </p>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Sponsor Profile Not Found
        </h2>
        <p className="text-gray-500 max-w-xs">
          The sponsor you are looking for might have been removed or the ID is incorrect.
        </p>
        <Button variant="primary" onClick={() => router.push('/sponsors')}>
          Back to Sponsors
        </Button>
      </div>
    );
  }

  // Filter events sponsored by this sponsor
  const sponsorEvents = (events || []).filter((event) =>
    event.sponsors?.some((sVal: unknown) => {
      const s = sVal as string | { id?: string; _id?: string };
      return typeof s === 'string' ? s === sponsorId : s?.id === sponsorId || s?._id === sponsorId;
    }),
  );

  // Aggregated totals
  const totalEventsCount = sponsorEvents.length;
  const totalRegisteredCount = Object.values(attendeeCounts).reduce(
    (acc, curr) => acc + curr.total,
    0,
  );
  const totalMetCount = Object.values(attendeeCounts).reduce((acc, curr) => acc + curr.met, 0);

  const getTierColor = (
    tier?: SponsorTier,
  ): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' => {
    switch (tier) {
      case SponsorTier.PLATINUM:
        return 'primary';
      case SponsorTier.GOLD:
        return 'warning';
      case SponsorTier.SILVER:
        return 'light';
      case SponsorTier.BRONZE:
        return 'error';
      case SponsorTier.PARTNER:
      default:
        return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
      case 'ON_GOING':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'DRAFT':
      case 'IN_REVIEW':
        return 'warning';
      case 'CANCELLED':
      default:
        return 'error';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Back navigation */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => router.back()}
          className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-brand-500 hover:text-brand-500 transition-all dark:bg-navy-800 dark:border-navy-700 dark:hover:border-brand-500"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            Sponsor Engagement Hub
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            View full profile, brand alignments, events alignment, and visitor relationships.
          </p>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <div className="relative overflow-hidden bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        {/* Dynamic backdrop accent */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Left Side: Brand Logo */}
        <div className="w-full md:w-auto flex flex-col items-center shrink-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-3xl border border-gray-100 dark:border-navy-800 bg-gray-50 dark:bg-navy-950 flex items-center justify-center shadow-md">
            {getImageUrl(sponsor.logo) ? (
              <Image
                src={getImageUrl(sponsor.logo)}
                alt={sponsor.name}
                fill
                sizes="128px"
                className="object-cover p-2"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-navy-800 bg-gray-100/50 dark:bg-navy-950/50">
                {sponsor.type === SponsorType.INDIVIDUAL ? (
                  <User size={56} strokeWidth={1} />
                ) : (
                  <Building2 size={56} strokeWidth={1} />
                )}
              </div>
            )}
          </div>
          <Badge
            color={sponsor.isActive ? 'success' : 'light'}
            className="mt-4 font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-lg border-none shadow-sm"
          >
            {sponsor.isActive ? 'ACTIVE PARTNER' : 'INACTIVE'}
          </Badge>
        </div>

        {/* Right Side: Details & Classification */}
        <div className="flex-1 space-y-6 w-full">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {sponsor.name}
              </h2>
              {sponsor.tier && (
                <Badge
                  color={getTierColor(sponsor.tier)}
                  className="flex items-center gap-1 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm"
                >
                  <Award size={12} />
                  {sponsor.tier}
                </Badge>
              )}
              <Badge
                color="light"
                className="font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg border-none shadow-sm text-gray-600 dark:text-navy-400"
              >
                {sponsor.type}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-navy-400 mt-1.5 flex items-center gap-1.5">
              {sponsor.companyName ? (
                <>
                  <Building2 size={16} className="text-gray-400" />
                  <span>{sponsor.companyName}</span>
                </>
              ) : (
                'Individual Contributor'
              )}
              {sponsor.designation && (
                <>
                  <span className="text-gray-300 dark:text-navy-700">•</span>
                  <span className="text-gray-400 font-medium">{sponsor.designation}</span>
                </>
              )}
            </p>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-4 border-t border-gray-50 dark:border-navy-850/50">
            {sponsor.email && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                  Contact Email
                </span>
                <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <Mail size={14} className="text-brand-500 shrink-0" />
                  <a href={`mailto:${sponsor.email}`} className="hover:underline truncate">
                    {sponsor.email}
                  </a>
                </p>
              </div>
            )}

            {sponsor.phone && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                  Direct Line
                </span>
                <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <Phone size={14} className="text-brand-500 shrink-0" />
                  <a href={`tel:${sponsor.phone}`} className="hover:underline">
                    {sponsor.phone}
                  </a>
                </p>
              </div>
            )}

            {sponsor.companyDomain && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                  Corporate URL
                </span>
                <p className="text-sm font-bold text-brand-500 flex items-center gap-1.5">
                  <Globe size={14} className="shrink-0" />
                  <a
                    href={sponsor.website || `https://${sponsor.companyDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline truncate"
                  >
                    {sponsor.companyDomain}
                  </a>
                </p>
              </div>
            )}

            {sponsor.valuation && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                  Partnership Valuation
                </span>
                <p className="text-sm font-bold text-success-600 dark:text-success-400 flex items-center gap-0.5">
                  <DollarSign size={14} />
                  <span>{sponsor.valuation}</span>
                </p>
              </div>
            )}

            {sponsor.address && (sponsor.address.city || sponsor.address.country) && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                  HQ Location
                </span>
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                  {sponsor.address.city}
                  {sponsor.address.city && sponsor.address.country && ', '}
                  {sponsor.address.country}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {sponsor.description && (
            <div className="pt-4 border-t border-gray-50 dark:border-navy-850/50 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-navy-500 tracking-wider">
                Partnership Bio / Details
              </span>
              <p className="text-sm text-gray-600 dark:text-navy-300 leading-relaxed max-w-4xl whitespace-pre-line">
                {sponsor.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 flex items-center gap-5 shadow-sm relative overflow-hidden">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0 shadow-sm">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-navy-500 uppercase tracking-wide">
              Events Sponsored
            </p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {totalEventsCount}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 flex items-center gap-5 shadow-sm relative overflow-hidden">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl shrink-0 shadow-sm">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-navy-500 uppercase tracking-wide">
              Total Event Registrations
            </p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {totalRegisteredCount}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 flex items-center gap-5 shadow-sm relative overflow-hidden">
          <div className="p-3.5 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 rounded-2xl shrink-0 shadow-sm animate-pulse-subtle">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-navy-500 uppercase tracking-wide">
              Checked-In Visitors (Met)
            </p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {totalMetCount}
            </h4>
          </div>
        </div>
      </div>

      {/* Main Sponsored Events & Visitors met section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Sponsored Events & Event-floor Interactions
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            Select an event to view the full details of all visitors and checked-in attendees.
          </p>
        </div>

        {totalEventsCount === 0 ? (
          <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-12 text-center shadow-sm">
            <Calendar
              className="mx-auto text-gray-300 dark:text-navy-800 mb-4"
              size={48}
              strokeWidth={1}
            />
            <h4 className="text-base font-bold text-gray-800 dark:text-white">
              No Event Alignments
            </h4>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              This sponsor is not currently registered for any events. Link them to events via the
              Events manager.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sponsorEvents.map((event) => {
              const isExpanded = expandedEventId === event.id;
              const hasLoadedCounts = attendeeCounts[event.id];

              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Event Header Panel */}
                  <div
                    onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-4">
                      {/* Event Banner Thumb or Icon */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-850/50 bg-gray-50 dark:bg-navy-950 flex items-center justify-center">
                        {getImageUrl(event.bannerImage) ? (
                          <Image
                            src={getImageUrl(event.bannerImage)}
                            alt={event.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <Calendar size={24} className="text-brand-500" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-gray-800 dark:text-white hover:text-brand-500 transition-colors">
                            {event.title}
                          </h4>
                          <Badge
                            color={getStatusColor(event.status)}
                            className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded-md"
                          >
                            {event.status}
                          </Badge>
                          <Badge
                            color="light"
                            className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded-md text-gray-500 dark:text-navy-400"
                          >
                            {event.type}
                          </Badge>
                        </div>

                        {/* Date & Location summary */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500 dark:text-navy-400">
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-gray-400" />
                            <span>
                              {new Date(event.startDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </span>

                          {event.location && event.location.address && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-gray-400" />
                              <span className="truncate max-w-xs">
                                {event.location.city || event.location.address}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side stats/action */}
                    <div className="flex items-center gap-5 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                      {hasLoadedCounts && (
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <span className="text-gray-500">
                            Reg:{' '}
                            <strong className="text-gray-800 dark:text-white">
                              {hasLoadedCounts.total}
                            </strong>
                          </span>
                          <span className="flex items-center gap-1 text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-500/10 px-2 py-0.5 rounded-md">
                            <CheckCircle size={12} />
                            <span>Met: {hasLoadedCounts.met}</span>
                          </span>
                        </div>
                      )}

                      <div className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-navy-800 rounded-xl transition-all">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible attendees section */}
                  {isExpanded && (
                    <div className="border-t border-gray-50 dark:border-navy-850/50 p-5 md:p-6 bg-gray-50/30 dark:bg-navy-950/10 animate-slide-down">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-gray-400 dark:text-navy-500 uppercase tracking-wider">
                            Visitors met at event floor
                          </h5>
                          <span className="text-[11px] text-gray-400 dark:text-navy-500 font-medium">
                            {hasLoadedCounts
                              ? `${hasLoadedCounts.met} Met / ${hasLoadedCounts.total} Total Registered`
                              : ''}
                          </span>
                        </div>

                        {/* Renders attendees */}
                        <EventAttendeesList
                          eventId={event.id}
                          onAttendeesLoaded={(total, met) =>
                            handleAttendeesLoaded(event.id, total, met)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Hidden pre-loader to pre-aggregate stats for stats cards even if not expanded */}
                  {!isExpanded && (
                    <div className="hidden">
                      <EventAttendeesList
                        eventId={event.id}
                        onAttendeesLoaded={(total, met) =>
                          handleAttendeesLoaded(event.id, total, met)
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
