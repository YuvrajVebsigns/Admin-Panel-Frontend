'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FormSubmissionsTable } from '@/modules/forms/components/FormSubmissionsTable';

export default function FormSubmissionsPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return <FormSubmissionsTable formId={id} />;
}
