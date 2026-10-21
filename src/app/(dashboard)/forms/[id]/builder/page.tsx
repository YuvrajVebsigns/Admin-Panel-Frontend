'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FormBuilder } from '@/modules/forms/components/FormBuilder';

export default function FormBuilderPage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return <FormBuilder formId={id} />;
}
