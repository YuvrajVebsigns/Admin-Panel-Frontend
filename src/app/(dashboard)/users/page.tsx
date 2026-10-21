'use client';

import React from 'react';
import { UserManagementTable } from '@/modules/attendees/components/UserManagementTable';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      {/* Header breadcrumb element */}
      <PageBreadcrumb pageTitle="User Management" />

      {/* Main Table view */}
      <UserManagementTable />
    </div>
  );
}
