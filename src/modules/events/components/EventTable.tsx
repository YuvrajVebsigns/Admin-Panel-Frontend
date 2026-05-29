'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Globe,
  Users,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import { EventManagement, EventStatus, EventType } from '../types/event.types';
import { useEvents } from '../hooks/useEvents';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';

interface EventTableProps {
  websiteId?: string;
  hideHeader?: boolean;
}

export const EventTable: React.FC<EventTableProps> = ({ websiteId, hideHeader }) => {
  const router = useRouter();
  const { events, isLoading, deleteEvent } = useEvents({ websiteId });
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const stats = React.useMemo(() => {
    const total = events.length;
    const active = events.filter(
      (e) => e.status === EventStatus.PUBLISHED || e.status === EventStatus.ON_GOING,
    ).length;
    const upcoming = events.filter((e) => new Date(e.startDate) > new Date()).length;
    const registrations = events.reduce((acc, curr) => acc + (curr.totalRegistrations || 0), 0);

    return [
      { label: 'Total Events', value: total, icon: Calendar, color: 'blue' },
      { label: 'Active Events', value: active, icon: CheckCircle, color: 'success' },
      { label: 'Upcoming', value: upcoming, icon: Clock, color: 'warning' },
      { label: 'Registrations', value: registrations, icon: Users, color: 'brand' },
    ];
  }, [events]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEvent(deleteId);
      setDeleteId(null);
    }
  };

  const columns: Column<EventManagement>[] = [
    {
      header: 'Event Name',
      accessor: (event) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white">{event.title}</span>
          <span className="text-xs text-gray-500 font-medium">/{event.slug}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (event) => (
        <div className="flex items-center gap-2">
          {event.type === EventType.ONLINE ? (
            <Globe size={14} className="text-blue-500" />
          ) : (
            <MapPin size={14} className="text-orange-500" />
          )}
          <span className="text-xs font-bold uppercase">{event.type}</span>
        </div>
      ),
    },
    {
      header: 'Schedule',
      accessor: (event) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <Calendar size={12} />
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>
          <div className="text-[10px] text-gray-400">
            {new Date(event.startDate).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            -
            {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      header: 'Registrations',
      accessor: (event) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Users size={14} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            {event.totalRegistrations || 0}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (event) => (
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
      ),
    },
    {
      header: 'Actions',
      accessor: (event) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/events/${event.id}/view`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-gray-500 hover:text-brand-500 transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => router.push(`/events/${event.id}`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-gray-500 hover:text-brand-500 transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => setDeleteId(event.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg text-gray-500 hover:text-error-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const showHeader = !hideHeader && !websiteId;

  return (
    <div className="space-y-8">
      {showHeader && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h2>
              <p className="text-sm text-gray-500">
                Create and manage your online and offline events
              </p>
            </div>
            <Button onClick={() => router.push('/events/new')}>Create New Event</Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="group bg-white dark:bg-navy-800 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 shadow-theme-sm hover:shadow-theme-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110',
                        stat.color === 'blue'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
                          : stat.color === 'success'
                            ? 'bg-success-50 text-success-600 dark:bg-success-500/10'
                            : stat.color === 'warning'
                              ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10'
                              : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10',
                      )}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {stat.label}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 dark:bg-navy-900 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        stat.color === 'blue'
                          ? 'bg-blue-500'
                          : stat.color === 'success'
                            ? 'bg-success-500'
                            : stat.color === 'warning'
                              ? 'bg-warning-500'
                              : 'bg-brand-500',
                      )}
                      style={{ width: stat.value > 0 ? '70%' : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="bg-white dark:bg-navy-800/50 rounded-3xl border border-gray-100 dark:border-navy-700 overflow-hidden">
        <DataTable
          data={events}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Search events..."
        />
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this event? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="error" onClick={handleDelete}>
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
