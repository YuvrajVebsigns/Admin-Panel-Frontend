'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { EventForm } from '@/modules/events/components/EventForm';
import { useEvent } from '@/modules/events/hooks/useEvents';

export default function EditEventPage() {
  const { id } = useParams();
  const { data: event, isLoading } = useEvent(id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="p-6 text-center text-gray-500">Event not found.</div>;
  }

  return (
    <div className="p-6">
      <EventForm initialData={event} />
    </div>
  );
}
