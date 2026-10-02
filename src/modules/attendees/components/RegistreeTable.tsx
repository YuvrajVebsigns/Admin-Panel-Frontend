'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Registree } from '../types/registree.types';
import {
  useRegistrees,
  useDeleteRegistree,
  useApproveRegistration,
  useRejectRegistration,
  useBlockRegistration,
} from '../hooks/useRegistrees';
import { useEvents } from '@/modules/events/hooks/useEvents';
import {
  Trash2,
  User,
  Users,
  Calendar,
  CheckCircle,
  Eye,
  Check,
  X,
  Ban,
  Clock,
  Sparkles,
  Mic,
  UserCheck,
} from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import toast from 'react-hot-toast';
import { ExportButton } from '@/components/common/ExportButton';
import { dataExportService } from '@/services/dataExport.service';
import { PERMISSIONS } from '@/constants/permissions';

export const RegistreeTable: React.FC = () => {
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    eventId?: string;
    tag?: string;
    status?: string;
    eventOnly?: boolean;
  }>({
    page: 1,
    limit: 10,
    search: '',
    eventOnly: true,
  });

  const { data, isLoading } = useRegistrees(params);
  const { events } = useEvents();

  const deleteMutation = useDeleteRegistree();
  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();
  const blockMutation = useBlockRegistration();

  const totalItems = data?.meta?.total || 0;

  // Load event registrees dataset for aggregate stats
  const { data: allStatsData } = useRegistrees({ limit: 1000, eventOnly: true });
  const allRegistrees = allStatsData?.data || [];

  const stats = React.useMemo(() => {
    const total = allRegistrees.length;
    const delegates = allRegistrees.filter(
      (r) =>
        r?.tags?.includes('delegate') ||
        r?.registrationType?.toLowerCase().includes('delegate') ||
        (!r?.tags?.includes('sponsor') && !r?.tags?.includes('speaker')),
    ).length;
    const sponsors = allRegistrees.filter(
      (r) =>
        r?.tags?.includes('sponsor') ||
        r?.registrationType?.toLowerCase().includes('sponsor') ||
        r?.registrationType?.toLowerCase().includes('partner'),
    ).length;
    const speakers = allRegistrees.filter(
      (r) => r?.tags?.includes('speaker') || r?.registrationType?.toLowerCase().includes('speaker'),
    ).length;
    const pending = allRegistrees.filter((r) => {
      const status = r?.status || r?.latestRegistration?.status;
      return status === 'PENDING';
    }).length;
    const attended = allRegistrees.filter(
      (r) => r && Array.isArray(r.history) && r.history.some((h) => h?.attended),
    ).length;
    const attendedRate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return { total, delegates, sponsors, speakers, pending, attended, attendedRate };
  }, [allRegistrees]);

  const handleDelete = async (registree: Registree) => {
    if (confirm(`Are you sure you want to delete the contact "${registree.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(registree.id);
        toast.success('Contact deleted successfully');
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'Failed to delete contact');
      }
    }
  };

  const handleApprove = async (id: string, eventId?: string) => {
    if (!eventId) {
      toast.error('No specific event associated with this registration');
      return;
    }
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

  const handleReject = async (id: string, eventId?: string) => {
    if (!eventId) {
      toast.error('No specific event associated with this registration');
      return;
    }
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

  const handleBlock = async (id: string, eventId?: string) => {
    if (!eventId) {
      toast.error('No specific event associated with this registration');
      return;
    }
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

  const renderRegistrationTypeBadge = (type?: string, tags?: string[]) => {
    const rawType = (type || '').toLowerCase();
    const isSponsor =
      rawType.includes('sponsor') || rawType.includes('partner') || tags?.includes('sponsor');
    const isSpeaker = rawType.includes('speaker') || tags?.includes('speaker');

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

  const columns: Column<Registree>[] = [
    {
      header: 'Name',
      accessor: (registree) => (
        <div className="flex items-center gap-2.5 min-w-[140px]">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-gray-100 dark:border-navy-800 bg-brand-50 dark:bg-navy-900/60 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 shadow-sm">
            {registree.name ? registree.name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <Link
            href={`/registrations/${registree.id}/view`}
            className="text-xs font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors truncate block"
            title={registree.name}
          >
            {registree.name || '—'}
          </Link>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: (registree) => (
        <div className="min-w-[170px]">
          <span
            className="text-xs font-medium text-gray-800 dark:text-gray-200 block truncate"
            title={registree.email}
          >
            {registree.email}
          </span>
          {registree.personalEmail && (
            <span
              className="text-[10px] text-gray-400 dark:text-navy-400 block truncate"
              title={`Personal: ${registree.personalEmail}`}
            >
              {registree.personalEmail}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (registree) => (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px] block">
          {registree.phoneNumber
            ? `${registree.countryCode ? registree.countryCode + ' ' : ''}${registree.phoneNumber}`.trim()
            : '—'}
        </span>
      ),
    },
    {
      header: 'Organization',
      accessor: (registree) => (
        <span
          className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate min-w-[130px]"
          title={registree.organization || '—'}
        >
          {registree.organization || '—'}
        </span>
      ),
    },
    {
      header: 'Designation',
      accessor: (registree) => (
        <div className="min-w-[130px]">
          <span
            className="text-xs font-medium text-gray-600 dark:text-gray-300 block truncate"
            title={registree.jobTitle || '—'}
          >
            {registree.jobTitle || '—'}
          </span>
          {registree.industryVertical && (
            <span
              className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold block truncate"
              title={registree.industryVertical}
            >
              {registree.industryVertical}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Registration Type',
      accessor: (registree) => (
        <div className="min-w-[130px]">
          {renderRegistrationTypeBadge(
            registree.registrationType || registree.latestRegistration?.registrationType,
            registree.tags,
          )}
        </div>
      ),
    },
    {
      header: 'Target Event',
      accessor: (registree) => {
        const matchHistory = params.eventId
          ? registree.history?.find((h) => h.eventId === params.eventId)
          : undefined;
        const targetEvent =
          matchHistory?.event ||
          registree.latestEvent ||
          registree.latestRegistration?.event ||
          registree.eventIds?.[0];
        const eventTitle = targetEvent?.title || '—';
        const totalEventsCount = registree.eventIds?.length || 0;

        return (
          <div className="min-w-[150px]">
            <span
              className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 block"
              title={eventTitle}
            >
              {eventTitle}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {targetEvent?.type && (
                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">
                  {targetEvent.type}
                </span>
              )}
              {totalEventsCount > 1 && (
                <span className="text-[10px] font-semibold bg-gray-100 dark:bg-navy-900 text-gray-600 dark:text-gray-300 px-1.5 py-0.2 rounded">
                  +{totalEventsCount - 1} more
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (registree) => {
        const targetReg = params.eventId
          ? registree.history?.find((h) => h.eventId === params.eventId)
          : registree.latestRegistration || registree.history?.[0];
        const status = targetReg?.status || registree.status || 'PENDING';

        return (
          <Badge
            color={
              status === 'APPROVED'
                ? 'success'
                : status === 'PENDING'
                  ? 'warning'
                  : status === 'REJECTED'
                    ? 'error'
                    : 'dark'
            }
            variant="light"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      header: 'Attended',
      accessor: (registree) => {
        const matchHistory = params.eventId
          ? registree.history?.find((h) => h.eventId === params.eventId)
          : undefined;
        const isAttended =
          matchHistory?.attended ??
          (registree.latestRegistration?.attended || registree.history?.some((h) => h.attended));

        return isAttended ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            <CheckCircle size={11} />
            Attended
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
      accessor: (registree) => {
        const loc = [registree.city, registree.country].filter(Boolean).join(', ');

        return (
          <span
            className="text-xs text-gray-600 dark:text-gray-300 block truncate min-w-[100px]"
            title={loc || registree.state || '—'}
          >
            {loc || registree.state || '—'}
          </span>
        );
      },
    },
    {
      header: 'Website',
      accessor: (registree) => {
        const ws = registree.websiteId;
        const websiteName = ws && typeof ws === 'object' ? ws.name || ws.domain : ws;

        return (
          <span
            className="text-xs font-medium text-gray-600 dark:text-gray-400 block truncate min-w-[90px]"
            title={websiteName ? String(websiteName) : '—'}
          >
            {websiteName ? String(websiteName) : '—'}
          </span>
        );
      },
    },
    {
      header: 'Registration Date',
      accessor: (registree) => {
        const regDate =
          registree.registeredAt ||
          registree.latestRegistration?.savedAt ||
          registree.latestRegistration?.registeredAt ||
          registree.createdAt;

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
      accessor: (registree) => {
        const matchHistory = params.eventId
          ? registree.history?.find((h) => h.eventId === params.eventId)
          : registree.latestRegistration || registree.history?.[0];
        const status =
          matchHistory?.status ||
          registree.status ||
          (registree.history?.length ? 'APPROVED' : 'PENDING');
        const targetEventId =
          params.eventId ||
          matchHistory?.eventId ||
          registree.eventIds?.[0]?.id ||
          registree.latestEvent?.id;

        return (
          <div className="flex items-center justify-end gap-1.5 min-w-[110px]">
            {targetEventId && (
              <>
                {(status === 'PENDING' || status === 'REJECTED' || status === 'BLOCKED') && (
                  <button
                    onClick={() => handleApprove(registree.id, targetEventId)}
                    disabled={approveMutation.isPending}
                    title="Approve Registration"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-emerald-600 shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all hover:scale-105"
                  >
                    <Check size={14} />
                  </button>
                )}
                {status === 'PENDING' && (
                  <button
                    onClick={() => handleReject(registree.id, targetEventId)}
                    disabled={rejectMutation.isPending}
                    title="Reject Registration"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-rose-600 shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all hover:scale-105"
                  >
                    <X size={14} />
                  </button>
                )}
                {status !== 'BLOCKED' && (
                  <button
                    onClick={() => handleBlock(registree.id, targetEventId)}
                    disabled={blockMutation.isPending}
                    title="Block Registration"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-red-500 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-all hover:scale-105"
                  >
                    <Ban size={14} />
                  </button>
                )}
              </>
            )}

            <Link
              href={`/registrations/${registree.id}/view`}
              title="View Registration Details"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-indigo-500 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all hover:scale-105"
            >
              <Eye size={14} />
            </Link>

            <button
              onClick={() => handleDelete(registree)}
              title="Delete Contact"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-red-500 shadow-sm hover:bg-red-50 dark:hover:bg-red-950/20 transition-all hover:scale-105"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-11 w-11 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Contacts
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.total}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-11 w-11 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Delegates
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.delegates}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-11 w-11 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Sponsors
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.sponsors}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Mic size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Speakers
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.speakers}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-11 w-11 rounded-xl bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pending
            </p>
            <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">
              {isLoading ? '...' : stats.pending}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-4 rounded-2xl shadow-theme-xs flex items-center gap-3.5 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Attended
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : `${stats.attended} (${stats.attendedRate}%)`}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter & Export Bar */}
      <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-2xl p-4 shadow-theme-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Event Filter dropdown */}
          <div className="flex flex-col min-w-[190px] w-full sm:w-auto">
            <select
              value={params.eventId || ''}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  eventId: e.target.value || undefined,
                }))
              }
              className="w-full appearance-none bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-500 transition-all dark:text-white cursor-pointer"
            >
              <option value="">All Registered Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Opportunity / Registration Type dropdown */}
          <div className="flex flex-col min-w-[180px] w-full sm:w-auto">
            <select
              value={params.tag || ''}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  tag: e.target.value || undefined,
                }))
              }
              className="w-full appearance-none bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-500 transition-all dark:text-white cursor-pointer"
            >
              <option value="">All Opportunity Types</option>
              <option value="delegate">CIO Delegates</option>
              <option value="sponsor">Sponsors & Partners</option>
              <option value="speaker">Speaker Opportunities</option>
            </select>
          </div>

          {/* Status Filter dropdown */}
          <div className="flex flex-col min-w-[150px] w-full sm:w-auto">
            <select
              value={params.status || ''}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  status: e.target.value || undefined,
                }))
              }
              className="w-full appearance-none bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-500 transition-all dark:text-white cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>

        <ExportButton
          permission={PERMISSIONS.REGISTRATIONS_EXPORT}
          exportTitle="Export Registrees Directory"
          exportDescription="Generate an analytical spreadsheet of event registrations, approval statuses, corporate affiliations, and registration types."
          showStatusFilter={true}
          statusOptions={[
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'blocked', label: 'Blocked' },
          ]}
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
              desc: 'KPI cards with total registrations, approvals, and breakdown.',
            },
            {
              sheet: 'Sheet 2: Registrees Directory',
              desc: 'Detailed table with name, designation, organization, email, registration type, and approval status.',
            },
          ]}
          initialFilters={{
            search: params.search,
            eventId: params.eventId,
            status: params.status,
          }}
          onExport={(filters) =>
            dataExportService.exportRegistrees({ ...filters, eventOnly: true })
          }
        />
      </div>

      {/* Main DataTable */}
      <DataTable<Registree>
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
        searchPlaceholder="Search by name, email, phone, organization, designation..."
      />
    </div>
  );
};
