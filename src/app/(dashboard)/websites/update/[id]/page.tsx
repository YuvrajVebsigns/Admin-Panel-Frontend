'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WebsiteForm } from '@/modules/websites/components/WebsiteForm';
import { websitesService } from '@/services/websites.service';
import { Website } from '@/modules/websites/types/website.types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UpdateWebsitePage() {
  const { id } = useParams();
  const [website, setWebsite] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      websitesService
        .getWebsite(id as string)
        .then(setWebsite)
        .catch(() => setWebsite(null))
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

  if (!website) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-xl space-y-3 rounded-2xl border border-error-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-900"
      >
        <h1 className="text-xl font-bold text-navy-900 dark:text-white">Website unavailable</h1>
        <p className="text-sm text-navy-500 dark:text-navy-300">
          The website could not be loaded. Return to the list and try again.
        </p>
        <Link
          href="/websites"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-600"
        >
          Back to websites
        </Link>
      </div>
    );
  }

  return <WebsiteForm initialData={website} />;
}
