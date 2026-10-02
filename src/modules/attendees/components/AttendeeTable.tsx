'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Attendee, AttendeeStatus } from '../types/attendee.types';
import { useAttendees, useDeleteAttendee, useCheckInAttendee } from '../hooks/useAttendees';
import { useEvents } from '@/modules/events/hooks/useEvents';
import {
  Edit,
  Trash2,
  User,
  CheckCircle,
  QrCode,
  Users,
  UserCheck,
  UserMinus,
  Ban,
  Percent,
  Eye,
  Sparkles,
  Mic,
  Calendar,
  Clock,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import toast from 'react-hot-toast';
import { ExportButton } from '@/components/common/ExportButton';
import { dataExportService } from '@/services/dataExport.service';
import { PERMISSIONS } from '@/constants/permissions';

interface AttendeeTableProps {
  onEdit: (attendee: Attendee) => void;
  onViewPass: (attendee: Attendee) => void;
  onCreateNew: () => void;
}

export const AttendeeTable: React.FC<AttendeeTableProps> = ({
  onEdit,
  onViewPass,
  onCreateNew,
}) => {
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    status?: AttendeeStatus;
    eventId?: string;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isLoading } = useAttendees(params);
  const { events } = useEvents();

  const deleteMutation = useDeleteAttendee();
  const checkInMutation = useCheckInAttendee();

  const totalItems = data?.meta?.total || 0;

  const { data: allStatsData } = useAttendees({ limit: 1000 });
  const allAttendees = allStatsData?.data || [];

  const stats = React.useMemo(() => {
    const total = allAttendees.length;
    const checkedIn = allAttendees.filter((a) => a.status === AttendeeStatus.CHECKED_IN).length;
    const invited = allAttendees.filter((a) => a.status === AttendeeStatus.INVITED).length;
    const blocked = allAttendees.filter((a) => a.status === AttendeeStatus.BLOCKED).length;
    const checkInRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return { total, checkedIn, invited, blocked, checkInRate };
  }, [allAttendees]);

  const handleCheckIn = async (attendee: Attendee) => {
    try {
      await checkInMutation.mutateAsync(attendee.passCode);
      toast.success(
        `${attendee.name || attendee.registrationDetails?.name} has been successfully checked in!`,
      );
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to check in attendee');
    }
  };

  const handleDelete = async (attendee: Attendee) => {
    const displayName = attendee.name || attendee.registrationDetails?.name || 'Attendee';
    if (confirm(`Are you sure you want to delete registration for ${displayName}?`)) {
      try {
        await deleteMutation.mutateAsync(attendee.id);
        toast.success('Registration deleted successfully');
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'Failed to delete attendee');
      }
    }
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatTime = (dateStr?: string | Date) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderRegistrationTypeBadge = (type?: string) => {
    const rawType = (type || '').toLowerCase();
    const isSponsor = rawType.includes('sponsor') || rawType.includes('partner');
    const isSpeaker = rawType.includes('speaker');

    if (isSponsor) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap">
          <Sparkles size={11} className="text-purple-500 shrink-0" />
          <span>Sponsor / Partner</span>
        </span>
      );
    }

    if (isSpeaker) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
          <Mic size={11} className="text-amber-500 shrink-0" />
          <span>Speaker</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 whitespace-nowrap">
        <UserCheck size={11} className="text-sky-500 shrink-0" />
        <span>Delegate</span>
      </span>
    );
  };

  const getStatusColor = (
    status: AttendeeStatus,
  ): 'success' | 'primary' | 'warning' | 'error' | 'dark' => {
    switch (status) {
      case AttendeeStatus.CHECKED_IN:
        return 'success';
      case AttendeeStatus.REGISTERED:
        return 'primary';
      case AttendeeStatus.INVITED:
        return 'warning';
      case AttendeeStatus.BLOCKED:
        return 'error';
      case AttendeeStatus.REJECTED:
      default:
        return 'dark';
    }
  };

  const columns: Column<Attendee>[] = [
    {
      header: 'Name',
      accessor: (attendee) => {
        const name = attendee.name || attendee.registrationDetails?.name || '—';
        return (
          <div className="flex items-center gap-2.5 min-w-[140px]">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-gray-100 dark:border-navy-800 bg-brand-50 dark:bg-navy-900/60 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 shadow-sm">
              {name !== '—' ? name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <Link
              href={`/attendance/${attendee.id}/view`}
              className="text-xs font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors truncate block"
              title={name}
            >
              {name}
            </Link>
          </div>
        );
      },
    },
    {
      header: 'Email',
      accessor: (attendee) => {
        const officialEmail = attendee.email || attendee.registrationDetails?.email || '—';
        const personalEmail = attendee.personalEmail || attendee.registrationDetails?.personalEmail;

        return (
          <div className="min-w-[170px]">
            <span
              className="text-xs font-medium text-gray-800 dark:text-gray-200 block truncate"
              title={officialEmail}
            >
              {officialEmail}
            </span>
            {personalEmail && (
              <span
                className="text-[10px] text-gray-400 dark:text-navy-400 block truncate"
                title={`Personal: ${personalEmail}`}
              >
                {personalEmail}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Phone Number',
      accessor: (attendee) => {
        const countryCode = attendee.countryCode || attendee.registrationDetails?.countryCode || '';
        const phone = attendee.phoneNumber || attendee.registrationDetails?.phoneNumber;
        const landline = attendee.landlineNumber || attendee.registrationDetails?.landlineNumber;

        return (
          <div className="min-w-[120px]">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap block">
              {phone ? `${countryCode ? countryCode + ' ' : ''}${phone}`.trim() : '—'}
            </span>
            {landline && (
              <span
                className="text-[10px] text-gray-400 dark:text-navy-400 block truncate"
                title={`Landline: ${landline}`}
              >
                Landline: {landline}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Organization',
      accessor: (attendee) => {
        const org = attendee.organization || attendee.registrationDetails?.organization || '—';
        return (
          <span
            className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate min-w-[130px]"
            title={org}
          >
            {org}
          </span>
        );
      },
    },
    {
      header: 'Designation',
      accessor: (attendee) => {
        const jobTitle = attendee.jobTitle || attendee.registrationDetails?.jobTitle || '—';
        const industry =
          attendee.industryVertical || attendee.registrationDetails?.industryVertical;

        return (
          <div className="min-w-[130px]">
            <span
              className="text-xs font-medium text-gray-600 dark:text-gray-300 block truncate"
              title={jobTitle}
            >
              {jobTitle}
            </span>
            {industry && (
              <span
                className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold block truncate"
                title={industry}
              >
                {industry}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Registration Type',
      accessor: (attendee) => {
        const regType = attendee.registrationType || attendee.registrationDetails?.registrationType;
        return <div className="min-w-[130px]">{renderRegistrationTypeBadge(regType)}</div>;
      },
    },
    {
      header: 'Event Assignment',
      accessor: (attendee) => {
        const ev = attendee.eventId;
        const title = typeof ev === 'object' && ev ? ev.title : 'Unknown Event';
        const type = typeof ev === 'object' && ev ? ev.type : '';

        return (
          <div className="min-w-[150px]">
            <span
              className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 block"
              title={title}
            >
              {title}
            </span>
            {type && (
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider block mt-0.5">
                {type}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Pass Code',
      accessor: (attendee) => (
        <code className="px-2 py-0.5 bg-gray-100 dark:bg-navy-900 text-xs font-mono font-bold rounded-lg text-brand-600 dark:text-brand-400 border border-gray-200/50 dark:border-navy-700 whitespace-nowrap">
          {attendee.passCode || attendee.registrationDetails?.passCode || '—'}
        </code>
      ),
    },
    {
      header: 'Status',
      accessor: (attendee) => (
        <Badge color={getStatusColor(attendee.status)} variant="light">
          {attendee.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Attended',
      accessor: (attendee) => {
        const isCheckedIn =
          attendee.status === AttendeeStatus.CHECKED_IN ||
          Boolean(attendee.checkedInAt) ||
          attendee.registrationDetails?.attended;

        return isCheckedIn ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            <CheckCircle size={11} />
            Checked In
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-navy-900 px-2 py-0.5 rounded-full whitespace-nowrap">
            <Clock size={11} />
            Not Yet
          </span>
        );
      },
    },
    {
      header: 'Location',
      accessor: (attendee) => {
        const city = attendee.city || attendee.registrationDetails?.city;
        const state = attendee.state || attendee.registrationDetails?.state;
        const country = attendee.country || attendee.registrationDetails?.country;
        const loc = [city, state, country].filter(Boolean).join(', ');

        return (
          <span
            className="text-xs text-gray-600 dark:text-gray-300 block truncate min-w-[110px]"
            title={loc || '—'}
          >
            {loc || '—'}
          </span>
        );
      },
    },
    {
      header: 'Registration Date',
      accessor: (attendee) => {
        const regDate =
          attendee.registeredAt || attendee.registrationDetails?.registeredAt || attendee.createdAt;

        return (
          <div className="whitespace-nowrap min-w-[105px]">
            <div className="flex items-center gap-1 text-xs font-bold text-gray-800 dark:text-gray-200">
              <Calendar size={11} className="text-brand-500 shrink-0" />
              <span>{formatDate(regDate)}</span>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-navy-400 pl-4 font-medium">
              {formatTime(regDate)}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (attendee) => (
        <div className="flex items-center justify-end gap-1.5 min-w-[120px]">
          {attendee.status !== AttendeeStatus.CHECKED_IN &&
            attendee.status !== AttendeeStatus.BLOCKED && (
              <button
                onClick={() => handleCheckIn(attendee)}
                title="Mark Checked In"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-emerald-500 shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all hover:scale-105"
              >
                <CheckCircle size={14} />
              </button>
            )}

          <Link
            href={`/attendance/${attendee.id}/view`}
            title="View History Details"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-indigo-500 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all hover:scale-105"
          >
            <Eye size={14} />
          </Link>

          <button
            onClick={() => onViewPass(attendee)}
            title="View Ticket Pass"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-brand-500 shadow-sm hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-all hover:scale-105"
          >
            <QrCode size={14} />
          </button>

          <button
            onClick={() => onEdit(attendee)}
            title="Edit Registration"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-400 hover:text-gray-700 dark:hover:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-navy-800 transition-all"
          >
            <Edit size={14} />
          </button>

          <button
            onClick={() => handleDelete(attendee)}
            title="Delete Registration"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-red-500 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-all hover:scale-105"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-7.5">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Total Registered
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.total}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Checked-In</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.checkedIn}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <Percent size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Check-In Rate</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : `${stats.checkInRate}%`}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <UserMinus size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Invited</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.invited}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <Ban size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Blocked</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.blocked}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Custom Filter Bar */}
      <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl p-5 shadow-theme-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Event Filter dropdown */}
          <div className="flex flex-col min-w-[200px] w-full sm:w-auto">
            <select
              value={params.eventId || ''}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  eventId: e.target.value || undefined,
                }))
              }
              className="w-full appearance-none bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-500 transition-all dark:text-white cursor-pointer"
            >
              <option value="">All Assigned Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter dropdown */}
          <div className="flex flex-col min-w-[160px] w-full sm:w-auto">
            <select
              value={params.status || ''}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  status: (e.target.value as AttendeeStatus) || undefined,
                }))
              }
              className="w-full appearance-none bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-brand-500 transition-all dark:text-white cursor-pointer"
            >
              <option value="">All Statuses</option>
              {Object.values(AttendeeStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <ExportButton
            permission={PERMISSIONS.ATTENDANCE_EXPORT}
            exportTitle="Export Event Attendees"
            exportDescription="Generate a detailed attendee spreadsheet with check-in timestamps, VIP statuses, passcode tracking, and event tags."
            showStatusFilter={true}
            statusOptions={Object.values(AttendeeStatus).map((status) => ({
              value: status,
              label: status.replace('_', ' '),
            }))}
            customFilters={[
              {
                key: 'eventId',
                label: 'Assigned Event',
                placeholder: 'All Events',
                options: events.map((ev) => ({
                  value: ev.id,
                  label: ev.title,
                })),
              },
            ]}
            sheetsInfo={[
              {
                sheet: 'Sheet 1: Analytics',
                desc: 'KPI cards with total registrations, confirmed guests, check-in rate.',
              },
              {
                sheet: 'Sheet 2: Attendees Directory',
                desc: 'Detailed list of names, emails, phones, ticket types, and badges.',
              },
            ]}
            initialFilters={{
              search: params.search,
              eventId: params.eventId,
              status: params.status,
            }}
            onExport={(filters) => dataExportService.exportAttendees(filters)}
          />
          <Button
            onClick={onCreateNew}
            className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl"
          >
            <Users size={16} />
            Register Attendee
          </Button>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<Attendee>
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        serverSide={true}
        totalItems={totalItems}
        page={params.page}
        limit={params.limit}
        search={params.search}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        onPageSizeChange={(limit) => setParams((prev) => ({ ...prev, limit, page: 1 }))}
        onSearchChange={(search) => setParams((prev) => ({ ...prev, search, page: 1 }))}
        searchPlaceholder="Search attendee by name, email, passcode..."
      />
    </div>
  );
};
