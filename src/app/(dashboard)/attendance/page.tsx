'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AttendeeTable } from '@/modules/attendees/components/AttendeeTable';
import { Attendee } from '@/modules/attendees/types/attendee.types';

export default function AttendancePage() {
  const router = useRouter();

  const handleEdit = (attendee: Attendee) => {
    router.push(`/attendance/${attendee.id}/edit`);
  };

  const handleViewPass = (attendee: Attendee) => {
    router.push(`/attendance/${attendee.id}/view`);
  };

  const handleCreateNew = () => {
    router.push('/attendance/create');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Event Attendance Console
        </h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
          Manage event invitees, check-in statuses, and print ticketing passes.
        </p>
      </div>

      <AttendeeTable
        onEdit={handleEdit}
        onViewPass={handleViewPass}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
