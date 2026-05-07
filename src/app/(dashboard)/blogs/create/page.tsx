'use client';
import React, { Suspense } from 'react';
import { BlogForm } from '@/modules/blogs/components/BlogForm';
import { useSearchParams } from 'next/navigation';

function CreateBlogContent() {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get('websiteId');

  return <BlogForm defaultWebsiteId={websiteId} />;
}

export default function CreateBlogPage() {
  return (
    <div className="animate-fade-in">
      <Suspense fallback={<div>Loading...</div>}>
        <CreateBlogContent />
      </Suspense>
    </div>
  );
}
