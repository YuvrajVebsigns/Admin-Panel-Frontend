'use client';
import React, { Suspense } from 'react';
import { EventForm } from '@/modules/events/components/EventForm';
import { Loader2 } from 'lucide-react';

export default function NewEventPage() {
  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        }
      >
        <EventForm />
      </Suspense>
    </div>
  );
}
