'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WebsiteForm } from '@/modules/websites/components/WebsiteForm';
import { websitesService } from '@/services/websites.service';
import { Website } from '@/modules/websites/types/website.types';
import { Loader2 } from 'lucide-react';

export default function UpdateWebsitePage() {
  const { id } = useParams();
  const [website, setWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      websitesService
        .getWebsite(id as string)
        .then(setWebsite)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return <WebsiteForm initialData={website} />;
}
