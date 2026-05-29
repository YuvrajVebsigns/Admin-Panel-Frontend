'use client';

import React, { useState } from 'react';
import { AttendeeTable } from '@/modules/attendees/components/AttendeeTable';
import { AttendeeFormModal } from '@/modules/attendees/components/AttendeeFormModal';
import { AttendeePassModal } from '@/modules/attendees/components/AttendeePassModal';
import { Attendee } from '@/modules/attendees/types/attendee.types';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function RegistrationsPage() {
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);

  const handleCreateNew = () => {
    setSelectedAttendee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setIsFormOpen(true);
  };

  const handleViewPass = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setIsPassOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedAttendee(null);
    setIsFormOpen(false);
  };

  const handleClosePass = () => {
    setSelectedAttendee(null);
    setIsPassOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header breadcrumb element */}
      <PageBreadcrumb pageTitle="Event Registrations" />

      {/* Main Table view */}
      <AttendeeTable
        onEdit={handleEdit}
        onViewPass={handleViewPass}
        onCreateNew={handleCreateNew}
      />

      {/* Form Drawer / Modal */}
      <AttendeeFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        attendee={selectedAttendee}
      />

      {/* Printable Badge Pass Ticket Modal */}
      <AttendeePassModal
        isOpen={isPassOpen}
        onClose={handleClosePass}
        attendee={selectedAttendee}
      />
    </div>
  );
}
