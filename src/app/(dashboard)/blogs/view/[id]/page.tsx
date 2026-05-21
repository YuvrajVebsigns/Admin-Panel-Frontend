'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogService } from '@/services/blog.service';
import { Blog, BlogComment } from '@/modules/blogs/types/blog.types';
import { BlogDetailsView } from '@/modules/blogs/components/BlogDetailsView';
import { Loader2, ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ViewBlogPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentFilter, setCommentFilter] = useState<string>('All');
  const [commentMeta, setCommentMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>({ page: 1, limit: 5, total: 0, totalPages: 1 });

  const fetchComments = async (page: number, filterStatus: string) => {
    setIsCommentsLoading(true);
    try {
      const response = await blogService.getBlogComments(id, {
        admin: true,
        status: filterStatus === 'All' ? undefined : filterStatus,
        page,
        limit: 5,
      });
      setComments(response.data);
      setCommentMeta(response.meta);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setIsCommentsLoading(false);
    }
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const blogData = await blogService.getBlog(id);
        setBlog(blogData);
        // Increment views
        blogService.incrementViews(id).catch(() => {});
      } catch (error) {
        toast.error('Failed to load blog details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, [id]);

  useEffect(() => {
    fetchComments(commentMeta.page, commentFilter);
  }, [id, commentFilter, commentMeta.page]);

  const handleFilterChange = (status: string) => {
    setCommentFilter(status);
    setCommentMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setCommentMeta((prev) => ({ ...prev, page }));
  };

  const handleUpdateCommentStatus = async (
    commentId: string,
    status: 'Pending' | 'Approved' | 'Rejected',
  ) => {
    try {
      await blogService.updateCommentStatus(commentId, status);
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, status } : c)));
      toast.success(`Comment status updated to ${status.toLowerCase()} successfully`);
      // If we are filtering by a specific status, re-fetch comments to reflect potential list changes
      if (commentFilter !== 'All' && commentFilter !== status) {
        fetchComments(commentMeta.page, commentFilter);
      }
    } catch (error) {
      toast.error('Failed to update comment status');
    }
  };

  const handleLike = async () => {
    try {
      const response = await blogService.likeBlog(id);
      if (blog) {
        setBlog({
          ...blog,
          engagement: {
            ...blog.engagement,
            likes: response.engagement?.likes || (blog.engagement?.likes || 0) + 1,
            views: blog.engagement?.views || 0,
            commentsCount: blog.engagement?.commentsCount || 0,
          },
        });
      }
      toast.success('Blog liked!');
    } catch (error) {
      toast.error('Failed to like blog');
    }
  };

  const handleCreateComment = async (data: {
    authorName: string;
    authorEmail: string;
    content: string;
  }) => {
    try {
      await blogService.createComment(id, data);
      if (blog) {
        setBlog({
          ...blog,
          engagement: {
            ...blog.engagement,
            likes: blog.engagement?.likes || 0,
            views: blog.engagement?.views || 0,
            commentsCount: (blog.engagement?.commentsCount || 0) + 1,
          },
        });
      }
      toast.success('Comment posted successfully!');
      // Switch filter back to 'All' and reset to page 1 to see the new comment
      setCommentFilter('All');
      setCommentMeta((prev) => ({ ...prev, page: 1 }));
      if (commentFilter === 'All' && commentMeta.page === 1) {
        fetchComments(1, 'All');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading blog details...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h2>
        <button
          onClick={() => router.push('/blogs')}
          className="text-brand-500 font-bold flex items-center gap-2 mx-auto hover:underline"
        >
          <ArrowLeft size={20} /> Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/blogs')}
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-navy-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1
              className="text-xl font-black text-gray-900 dark:text-white truncate max-w-[300px]"
              title={blog.title}
            >
              {blog.title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Manage and moderate this blog post
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/blogs/update/${blog.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 active:scale-95"
          >
            <Edit size={18} />
            Edit Blog
          </button>
        </div>
      </div>

      {/* Main View */}
      <BlogDetailsView
        blog={blog}
        comments={comments}
        commentMeta={commentMeta}
        commentFilter={commentFilter}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onUpdateCommentStatus={handleUpdateCommentStatus}
        onLike={handleLike}
        onCreateComment={handleCreateComment}
        isCommentsLoading={isCommentsLoading}
      />
    </div>
  );
}
