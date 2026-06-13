'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  Globe,
  Clock,
  Users,
  Award,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  ChevronRight,
  User,
  Building2,
  Search,
  Printer,
} from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import {
  useEvent,
  useEventMeetings,
  useDeleteEventMeeting,
} from '@/modules/events/hooks/useEvents';
import { useEventAttendees, useEventAttendeeCount } from '@/modules/attendees/hooks/useAttendees';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { EventStatus, EventType, EventMeeting } from '../types/event.types';
import { Attendee } from '@/modules/attendees/types/attendee.types';
import { Sponsor } from '@/modules/sponsors/types/sponsor.types';
import { EventMeetingModal } from './EventMeetingModal';

export const EventDetailsView: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<EventMeeting | null>(null);

  // Fetch event and attendee data
  const { data: event, isLoading: isEventLoading } = useEvent(id as string);
  const { data: attendees, isLoading: isAttendeesLoading } = useEventAttendees(id as string);
  const { data: attendeeCountData } = useEventAttendeeCount(id as string);
  const { data: meetings = [], isLoading: isMeetingsLoading } = useEventMeetings(id as string);
  const deleteMeetingMutation = useDeleteEventMeeting();

  const handleBookMeeting = () => {
    setMeetingToEdit(null);
    setIsMeetingModalOpen(true);
  };

  const handleEditMeeting = (meeting: EventMeeting) => {
    setMeetingToEdit(meeting);
    setIsMeetingModalOpen(true);
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (confirm('Are you sure you want to cancel this meeting reservation?')) {
      try {
        await deleteMeetingMutation.mutateAsync({ eventId: id as string, meetingId });
      } catch (err) {
        // error handled by hook
      }
    }
  };

  const handlePrintMeetings = () => {
    if (!meetings || meetings.length === 0 || !event) return;

    const rows = meetings
      .map((meeting, idx) => {
        const sponsorObj =
          typeof meeting.sponsorId === 'object' ? (meeting.sponsorId as Sponsor) : null;
        const sponsorName = sponsorObj ? sponsorObj.name : 'Unknown Sponsor';
        const sponsorCompany = sponsorObj?.companyName || '';

        const attendeeNames = (meeting.attendeeIds || []).map((att) =>
          typeof att === 'object' ? (att as Attendee).name : 'Unknown Guest',
        );

        return `
          <tr>
            <td style="text-align:center;font-weight:600;">${idx + 1}</td>
            <td>
              <strong>${meeting.agendaTime || '—'}</strong>
            </td>
            <td>${meeting.agendaTitle || '—'}</td>
            <td>
              <strong>${sponsorName}</strong>
              ${sponsorCompany ? `<br/><span style="font-size:11px;color:#666;">${sponsorCompany}</span>` : ''}
            </td>
            <td>${attendeeNames.join(', ') || '—'}</td>
            <td style="font-size:11px;color:#555;">${meeting.notes || '—'}</td>
            <td>&nbsp;</td>
          </tr>`;
      })
      .join('');

    const eventDate = new Date(event.startDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Meeting Schedule — ${event.title}</title>
        <style>
          @page { size: A4 portrait; margin: 14mm 12mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 0; }
          .header { text-align: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 3px solid #e31e24; }
          .header h1 { font-size: 20px; font-weight: 700; color: #0a192f; margin-bottom: 4px; }
          .header p { font-size: 12px; color: #555; }
          .meta { display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 14px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          thead th {
            background: #0a192f; color: #fff; padding: 10px 8px;
            text-align: left; font-weight: 600; font-size: 11px;
            text-transform: uppercase; letter-spacing: 0.5px;
          }
          tbody tr { border-bottom: 1px solid #e5e5e5; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          tbody td { padding: 10px 8px; vertical-align: top; line-height: 1.5; }
          .notes-col { min-width: 180px; }
          .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #999; padding-top: 10px; border-top: 1px solid #e5e5e5; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            thead th { background: #0a192f !important; color: #fff !important; }
            tbody tr:nth-child(even) { background: #f9fafb !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${event.title}</h1>
          <p>Guest–Sponsor Scheduled Meetings</p>
        </div>
        <div class="meta">
          <span><strong>Date:</strong> ${eventDate}</span>
          <span><strong>Total Meetings:</strong> ${meetings.length}</span>
          <span><strong>Printed:</strong> ${new Date().toLocaleString('en-IN')}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:35px;text-align:center;">#</th>
              <th style="width:85px;">Time</th>
              <th>Agenda / Session</th>
              <th>Sponsor</th>
              <th>Invitee Guests</th>
              <th>System Notes</th>
              <th class="notes-col">Handwritten Notes</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="footer">
          Generated from Core Media Admin Panel &bull; ${event.title}
        </div>
      </body>
      </html>`;

    const printWindow = window.open('', '_blank', 'width=1100,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);
    }
  };

  if (isEventLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-gray-400">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 max-w-lg mx-auto mt-20">
        <XCircle className="mx-auto text-error-500 mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Event Not Found</h3>
        <p className="text-sm text-gray-500 mt-2">
          The event you are looking for might have been deleted.
        </p>
        <Button onClick={() => router.push('/events')} className="mt-6">
          Back to Events
        </Button>
      </div>
    );
  }

  // Calculate attendee check-in counts
  const totalAttendees = attendees?.length || 0;
  const checkedInAttendees =
    attendees?.filter((a: Attendee) => a.status === 'CHECKED_IN').length || 0;

  // Try to read count from the count API response, or fall back
  const registrationCount =
    attendeeCountData !== undefined && attendeeCountData !== null
      ? typeof attendeeCountData === 'object' && 'count' in attendeeCountData
        ? (attendeeCountData as { count: number }).count
        : attendeeCountData
      : event.totalRegistrations || totalAttendees;

  // Filter attendees list
  const filteredAttendees = (attendees || []).filter((a: Attendee) => {
    const term = attendeeSearch.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      (a.status || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/events')}
            className="p-2.5 rounded-xl bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 text-gray-500 hover:text-brand-500 transition-all shadow-theme-xs hover:shadow-theme-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold mb-1">
              <span>Dashboard</span>
              <ChevronRight size={12} />
              <span>Events</span>
              <ChevronRight size={12} />
              <span className="text-gray-900 dark:text-white truncate max-w-[150px]">
                {event.title}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {event.title}
              <Badge
                color={
                  event.status === EventStatus.PUBLISHED
                    ? 'success'
                    : event.status === EventStatus.SCHEDULED
                      ? 'info'
                      : event.status === EventStatus.CANCELLED
                        ? 'error'
                        : 'warning'
                }
              >
                {event.status.replace('_', ' ')}
              </Badge>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleBookMeeting}
            className="bg-white dark:bg-navy-800 border-brand-200 dark:border-brand-900/50 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 text-brand-600 dark:text-brand-400"
          >
            <Calendar size={16} className="mr-2" />
            Book Meeting
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/events/${event.id}`)}
            className="bg-white dark:bg-navy-800"
          >
            <Edit size={16} className="mr-2" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* Hero Banner Grid */}
      {getImageUrl(event.bannerImage) && (
        <div className="mb-10 rounded-3xl overflow-hidden h-[300px] relative border border-gray-100 dark:border-navy-700 shadow-theme-sm">
          <img
            src={getImageUrl(event.bannerImage)}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">
              {event.type} Event
            </p>
            <h2 className="text-2xl font-extrabold">{event.title}</h2>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 shadow-theme-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Date & Time
              </p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {new Date(event.startDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h4>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 shadow-theme-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 capitalize">
                {event.type.toLowerCase()} Event
              </h4>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 shadow-theme-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Registered
              </p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {registrationCount} Attendees
              </h4>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 shadow-theme-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Checked In (Met)
              </p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                {checkedInAttendees} / {totalAttendees}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Span 2): Scheduling, Location, Agenda */}
        <div className="lg:col-span-2 space-y-8">
          {/* Scheduling & Timing Card */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock size={20} className="text-brand-500" />
              Event Schedule & Hours
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Start Timing
                </span>
                <p className="text-sm font-extrabold text-gray-800 dark:text-white mt-1">
                  {new Date(event.startDate).toLocaleDateString([], {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(event.startDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  End Timing
                </span>
                <p className="text-sm font-extrabold text-gray-800 dark:text-white mt-1">
                  {new Date(event.endDate).toLocaleDateString([], {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(event.endDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Location & Joining Card */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              {event.type === EventType.ONLINE ? (
                <Globe size={20} className="text-blue-500" />
              ) : (
                <MapPin size={20} className="text-orange-500" />
              )}
              {event.type === EventType.ONLINE
                ? 'Virtual Event Access'
                : 'Physical Location Details'}
            </h3>

            {event.type === EventType.ONLINE ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  This is a virtual event. You can join using the secure meeting invitation link
                  below:
                </p>
                {event.meetingLink ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 gap-4">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="text-blue-600" size={20} />
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200 truncate max-w-sm">
                        {event.meetingLink}
                      </span>
                    </div>
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/15"
                    >
                      Join Meeting
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-warning-600 bg-warning-50 dark:bg-warning-500/10 p-4 rounded-xl border border-warning-100 dark:border-warning-900/30">
                    No joining link has been configured yet.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-start gap-4">
                  <MapPin className="text-orange-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-xs font-bold text-orange-900 dark:text-orange-200 uppercase tracking-wider">
                      Event Venue Address
                    </h4>
                    <p className="text-sm font-extrabold text-gray-800 dark:text-white mt-1">
                      {event.location?.address || 'No full address specified.'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {event.location?.city || 'No city specified.'}
                    </p>
                  </div>
                </div>

                {event.location?.mapLink && (
                  <a
                    href={event.location.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full p-3.5 bg-gray-50 dark:bg-navy-900 hover:bg-gray-100 dark:hover:bg-navy-850 rounded-2xl border border-gray-100 dark:border-navy-700 transition-all text-xs font-extrabold text-gray-700 dark:text-gray-200 gap-2"
                  >
                    <MapPin size={16} className="text-brand-500" />
                    Open Location on Google Maps
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Agenda Timeline Card */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <Clock size={20} className="text-brand-500" />
              Event Timeline & Agenda
            </h3>

            {event.agenda && event.agenda.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-gray-100 dark:border-navy-700 ml-4 space-y-8">
                {event.agenda.map((item, index) => (
                  <div key={index} className="relative">
                    {/* timeline bullet dot */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-navy-800 bg-brand-500" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase bg-brand-50 dark:bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded-md">
                          {item.time}
                        </span>
                        {item.speaker && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                            <User size={12} />
                            {item.speaker}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1.5">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-100 dark:border-navy-750 rounded-2xl">
                <Clock className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-xs text-gray-400 italic">
                  No agenda segments configured for this event.
                </p>
              </div>
            )}
          </div>

          {/* Scheduled Meetings Card */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-brand-500" />
                Guest-Sponsor Scheduled Meetings
              </h3>
              <div className="flex items-center gap-2">
                {meetings && meetings.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrintMeetings}
                    className="text-xs px-3 py-1.5"
                    type="button"
                  >
                    <Printer size={14} className="mr-1.5" />
                    Print List
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleBookMeeting}
                  className="text-xs px-3 py-1.5"
                >
                  <Clock size={14} className="mr-1.5" />
                  Reserve Slot
                </Button>
              </div>
            </div>

            {isMeetingsLoading ? (
              <div className="text-center py-6 text-xs text-gray-400">
                Loading meeting reservations...
              </div>
            ) : meetings && meetings.length > 0 ? (
              <div className="space-y-4">
                {meetings.map((meeting) => {
                  const sponsorObj =
                    typeof meeting.sponsorId === 'object' ? (meeting.sponsorId as Sponsor) : null;
                  const sponsorName = sponsorObj ? sponsorObj.name : 'Unknown Sponsor';
                  const sponsorCompany = sponsorObj ? sponsorObj.companyName : '';

                  const attendeeNames = (meeting.attendeeIds || []).map((att) =>
                    typeof att === 'object' ? (att as Attendee).name : 'Unknown Guest',
                  );

                  return (
                    <div
                      key={meeting.id}
                      className="p-5 rounded-2xl border border-gray-50 dark:border-navy-900 bg-gray-50/50 dark:bg-navy-900/30 hover:border-gray-200 dark:hover:border-navy-750 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase bg-brand-50 dark:bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded-md">
                            {meeting.agendaTime}
                          </span>
                          <span className="text-xs font-bold text-gray-800 dark:text-white truncate">
                            {meeting.agendaTitle}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2.5">
                            <Building2 size={16} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Sponsor
                              </p>
                              <p className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">
                                {sponsorName}
                              </p>
                              {sponsorCompany && (
                                <p className="text-[10px] text-gray-400">{sponsorCompany}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <User size={16} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Invitees
                              </p>
                              <p className="text-xs font-medium text-gray-800 dark:text-white mt-0.5">
                                {attendeeNames.join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {meeting.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-navy-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-navy-800 max-w-2xl">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              Note:
                            </span>{' '}
                            {meeting.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 self-end md:self-start">
                        <button
                          onClick={() => handleEditMeeting(meeting)}
                          className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl transition-colors shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCancelMeeting(meeting.id)}
                          className="px-3 py-1.5 text-xs font-bold text-error-600 hover:text-error-750 dark:hover:text-error-400 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl transition-colors shadow-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-100 dark:border-navy-750 rounded-2xl">
                <Users className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-xs text-gray-400 italic">
                  No meetings scheduled for this event yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookMeeting}
                  className="mt-4 text-xs bg-white dark:bg-navy-800"
                >
                  Book First Meeting
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sponsors & Registered Attendees */}
        <div className="space-y-8">
          {/* Sponsors Card */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Award size={18} className="text-brand-500" />
              Aligned Sponsors ({event.sponsors?.length || 0})
            </h3>

            <div className="space-y-3">
              {event.sponsors && event.sponsors.length > 0 ? (
                event.sponsors.map((sponsorVal: unknown, idx) => {
                  const sponsor = sponsorVal as Sponsor | string;
                  let logoUrl = '';
                  if (typeof sponsor === 'object' && sponsor) {
                    if (typeof sponsor.logo === 'string') {
                      logoUrl = sponsor.logo;
                    } else if (sponsor.logo && typeof sponsor.logo === 'object') {
                      logoUrl = sponsor.logo.thumbnail || sponsor.logo.original || '';
                    }
                  }

                  const sponsorName =
                    typeof sponsor === 'string' ? 'Aligned Sponsor' : sponsor.name;
                  const companyName = typeof sponsor === 'string' ? '' : sponsor.companyName;
                  const tier = typeof sponsor === 'string' ? '' : sponsor.tier;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (typeof sponsor === 'object' && sponsor?.id) {
                          router.push(`/sponsors/${sponsor.id}`);
                        }
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl border border-gray-50 dark:border-navy-900 hover:border-gray-200 dark:hover:border-navy-700 bg-gray-50/50 dark:bg-navy-900/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-navy-855 bg-white dark:bg-navy-950 flex items-center justify-center">
                          {logoUrl ? (
                            <img src={logoUrl} alt="" className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-gray-400">
                              <Building2 size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                            {sponsorName}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {companyName || 'Individual Sponsor'}
                          </p>
                        </div>
                      </div>

                      {tier && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 text-gray-500">
                          {tier}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 border border-dashed border-gray-100 dark:border-navy-750 rounded-2xl">
                  <Award className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-xs text-gray-400 italic">
                    No aligned sponsors for this event.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Registered Attendees/Visitors Card */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-brand-500" />
                Registrations ({totalAttendees})
              </h3>
            </div>

            {/* Attendee search */}
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search attendees..."
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {isAttendeesLoading ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  Loading attendee records...
                </div>
              ) : filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee: Attendee, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-gray-50 dark:border-navy-900 bg-gray-50/50 dark:bg-navy-900/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 dark:text-white truncate">
                        {attendee.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{attendee.email}</p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span
                        className={cn(
                          'text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md',
                          attendee.status === 'CHECKED_IN'
                            ? 'bg-success-50 dark:bg-success-500/10 text-success-600'
                            : attendee.status === 'REGISTERED'
                              ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600'
                              : 'bg-gray-100 dark:bg-navy-850 text-gray-500',
                        )}
                      >
                        {attendee.status || 'INVITED'}
                      </span>
                      {attendee.checkedInAt && (
                        <span className="text-[8px] text-gray-400">
                          {new Date(attendee.checkedInAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-100 dark:border-navy-750 rounded-2xl">
                  <Users className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-xs text-gray-400 italic">No registrations found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <EventMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => {
          setIsMeetingModalOpen(false);
          setMeetingToEdit(null);
        }}
        event={event}
        meetingToEdit={meetingToEdit}
      />
    </div>
  );
};
