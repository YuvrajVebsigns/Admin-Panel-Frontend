'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { Registree } from '../types/registree.types';
import { useRegistrees, useDeleteRegistree } from '../hooks/useRegistrees';
import { useEvents } from '@/modules/events/hooks/useEvents';
import { Trash2, User, Users, Calendar, CheckCircle, Percent, Eye, Building } from 'lucide-react';
import Badge from '@/components/ui/badge/Badge';
import toast from 'react-hot-toast';

export const RegistreeTable: React.FC = () => {
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    search: string;
    eventId?: string;
  }>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isLoading } = useRegistrees(params);
  const { events } = useEvents();

  const deleteMutation = useDeleteRegistree();

  const totalItems = data?.meta?.total || 0;

  // Load a broader dataset for aggregate stats
  const { data: allStatsData } = useRegistrees({ limit: 1000 });
  const allRegistrees = allStatsData?.data || [];

  const stats = React.useMemo(() => {
    const total = allRegistrees.length;
    const withEvents = allRegistrees.filter((r) => r.eventIds && r.eventIds.length > 0).length;
    const attended = allRegistrees.filter(
      (r) => r.history && r.history.some((h) => h.attended),
    ).length;
    const attendedRate = total > 0 ? Math.round((attended / total) * 100) : 0;
    const totalEvents = allRegistrees.reduce((acc, r) => acc + (r.eventIds?.length || 0), 0);

    return { total, withEvents, attended, attendedRate, totalEvents };
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

  const columns: Column<Registree>[] = [
    {
      header: 'Contact Profile',
      accessor: (registree) => (
        <div className="flex items-center gap-3.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-navy-800 bg-gray-50 dark:bg-navy-900/50 flex items-center justify-center text-gray-500 shadow-sm">
            <User size={20} className="text-gray-400 dark:text-navy-500" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/registrations/${registree.id}/view`}
              className="text-sm font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors truncate block"
            >
              {registree.name}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{registree.email}</p>
            {registree.phoneNumber && (
              <p className="text-[11px] text-gray-400 dark:text-navy-400">
                {registree.countryCode ? `${registree.countryCode} ` : ''}
                {registree.phoneNumber}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Organization',
      accessor: (registree) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {registree.organization || '—'}
        </span>
      ),
    },
    {
      header: 'Events Registered',
      accessor: (registree) => {
        const eventCount = registree.eventIds?.length || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <Calendar size={14} />
            </div>
            <span className="text-sm font-bold text-gray-800 dark:text-white">{eventCount}</span>
          </div>
        );
      },
    },
    {
      header: 'Attended',
      accessor: (registree) => {
        const attendedCount = registree.history?.filter((h) => h.attended).length || 0;
        const totalCount = registree.history?.length || 0;
        return (
          <Badge color={attendedCount > 0 ? 'success' : 'warning'} variant="light">
            {attendedCount}/{totalCount}
          </Badge>
        );
      },
    },
    {
      header: 'Website',
      accessor: (registree) => {
        const ws = registree.websiteId;
        if (!ws) return <span className="text-xs text-gray-400">—</span>;
        const name = typeof ws === 'object' ? ws.name : ws;
        return <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{name}</span>;
      },
    },
    {
      header: 'Joined',
      accessor: (registree) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(registree.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (registree) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/registrations/${registree.id}/view`}
            title="View Contact Details"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-900 text-indigo-500 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all hover:scale-105"
          >
            <Eye size={16} />
          </Link>

          <button
            onClick={() => handleDelete(registree)}
            title="Delete Contact"
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
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Contacts</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.total}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Total Event Regs
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.totalEvents}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">With Events</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.withEvents}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Building size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Attended Events
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : stats.attended}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 p-5 rounded-2xl shadow-theme-xs flex items-center gap-4 transition-all hover:shadow-theme-md hover:-translate-y-0.5">
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <Percent size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Attend Rate</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {isLoading ? '...' : `${stats.attendedRate}%`}
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
              <option value="">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>
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
        searchPlaceholder="Search contacts by name, email, phone..."
      />
    </div>
  );
};
