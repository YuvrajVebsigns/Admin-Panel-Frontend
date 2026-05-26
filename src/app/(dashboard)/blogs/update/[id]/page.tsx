'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { BlogForm } from '@/modules/blogs/components/BlogForm';
import { useBlog } from '@/modules/blogs/hooks/useBlogs';
import { Loader2 } from 'lucide-react';

export default function UpdateBlogPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: blog, isLoading } = useBlog(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Fetching blog content...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blog Not Found</h2>
        <p className="text-gray-500">The blog you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <BlogForm key={blog.updatedAt || blog.id} initialData={blog} />
    </div>
  );
}
