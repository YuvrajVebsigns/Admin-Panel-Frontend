'use client';

import React, { Suspense } from 'react';
import { CommunicationMappingManager } from '@/modules/communications/components/CommunicationMappingManager';

export default function CreateCommunicationMappingPage() {
  return (
    <div className="animate-fade-in">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
          </div>
        }
      >
        <CommunicationMappingManager />
      </Suspense>
    </div>
  );
}
