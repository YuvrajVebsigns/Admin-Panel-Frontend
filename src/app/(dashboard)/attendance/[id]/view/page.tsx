import React from 'react';
import { AttendeeDetailsView } from '@/modules/attendees/components/AttendeeDetailsView';

export default function AttendeeDetailsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendee Details</h1>
        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
          View event details, registration status, desk check-in audit logs, and boarding pass.
        </p>
      </div>

      <AttendeeDetailsView />
    </div>
  );
}
