'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TemplateForm } from '@/modules/communications/components/TemplateForm';

export default function EditTemplatePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="animate-fade-in">
      <TemplateForm templateId={id} />
    </div>
  );
}
