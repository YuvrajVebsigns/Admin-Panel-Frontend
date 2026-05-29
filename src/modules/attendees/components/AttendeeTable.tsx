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
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import toast from 'react-hot-toast';

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

  // Aggregate stats from the current view or queries
  // To have accurate summary counts, let's query all or fetch statistics.
  // Since we have paginated list, let's also pull a non-paginated search to compute stats,
  // or simply calculate from a wide load, or fetch them dynamically.
  // Standard approach: load wide stats, or simply calculate from the currently fetched paginated list and metadata.
  const totalItems = data?.meta?.total || 0;

  // Let's load counts by querying status-specific totals or calculate from current meta
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
      toast.success(`${attendee.name} has been successfully checked in!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to check in attendee');
    }
  };

  const handleDelete = async (attendee: Attendee) => {
    if (confirm(`Are you sure you want to delete registration for ${attendee.name}?`)) {
      try {
        await deleteMutation.mutateAsync(attendee.id);
        toast.success('Registration deleted successfully');
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'Failed to delete attendee');
      }
    }
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
      header: 'Attendee Profile',
      accessor: (attendee) => (
        <div className="flex items-center gap-3.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-navy-800 bg-gray-50 dark:bg-navy-900/50 flex items-center justify-center text-gray-500 shadow-sm">
            <User size={20} className="text-gray-400 dark:text-navy-500" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/registrations/${attendee.id}/view`}
              className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors truncate block"
            >
              {attendee.name}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{attendee.email}</p>
            {attendee.phone && (
              <p className="text-[11px] text-gray-400 dark:text-navy-400">{attendee.phone}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Event Assignment',
      accessor: (attendee) => {
        const ev = attendee.eventId;
        const title = typeof ev === 'object' && ev ? ev.title : 'Unknown Event';
        const type = typeof ev === 'object' && ev ? ev.type : '';

        return (
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white max-w-[200px] truncate">
              {title}
            </p>
            {type && (
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mt-0.5">
                {type}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Organization',
      accessor: (attendee) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {attendee.organization || '-'}
        </span>
      ),
    },
    {
      header: 'Pass Code',
      accessor: (attendee) => (
        <code className="px-2.5 py-1 bg-gray-100 dark:bg-navy-900 text-xs font-mono font-bold rounded-lg text-brand-600 dark:text-brand-400 border border-gray-200/50 dark:border-navy-700">
          {attendee.passCode}
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
      header: 'Timestamps',
      accessor: (attendee) => (
        <div className="text-xs space-y-0.5 text-gray-500 dark:text-gray-400">
          <p>Reg: {new Date(attendee.registeredAt || attendee.createdAt).toLocaleDateString()}</p>
          {attendee.checkedInAt && (
            <p className="text-emerald-500 font-medium">
              In:{' '}
              {new Date(attendee.checkedInAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (attendee) => (
        <div className="flex items-center justify-end gap-2">
          {attendee.status !== AttendeeStatus.CHECKED_IN &&
            attendee.status !== AttendeeStatus.BLOCKED && (
              <button
                onClick={() => handleCheckIn(attendee)}
                title="Mark Checked In"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-emerald-500 shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all hover:scale-105"
              >
                <CheckCircle size={18} />
              </button>
            )}

          <Link
            href={`/registrations/${attendee.id}/view`}
            title="View History Details"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-indigo-500 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all hover:scale-105"
          >
            <Eye size={16} />
          </Link>

          <button
            onClick={() => onViewPass(attendee)}
            title="View Ticket Pass"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-brand-500 shadow-sm hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-all hover:scale-105"
          >
            <QrCode size={17} />
          </button>

          <button
            onClick={() => onEdit(attendee)}
            title="Edit Registration"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-gray-400 hover:text-gray-700 dark:hover:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-navy-800 transition-all"
          >
            <Edit size={16} />
          </button>

          <button
            onClick={() => handleDelete(attendee)}
            title="Delete Registration"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-red-500 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-all hover:scale-105"
          >
            <Trash2 size={16} />
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

        <Button
          onClick={onCreateNew}
          className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl"
        >
          <Users size={16} />
          Register Attendee
        </Button>
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
