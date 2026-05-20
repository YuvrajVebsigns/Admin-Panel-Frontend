'use client';
import React from 'react';
import { EventTable } from '@/modules/events/components/EventTable';

export default function EventsPage() {
  return (
    <div className="p-6">
      <EventTable />
    </div>
  );
}
