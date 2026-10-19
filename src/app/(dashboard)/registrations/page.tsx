'use client';

import React from 'react';
import { RegistreeTable } from '@/modules/attendees/components/RegistreeTable';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

function RegistrationsPage() {
  return (
    <div className="space-y-6">
      {/* Header breadcrumb element */}
      <PageBreadcrumb pageTitle="Event Registrations" />

      {/* Main Table view */}
      <RegistreeTable />
    </div>
  );
}
export default RegistrationsPage;
