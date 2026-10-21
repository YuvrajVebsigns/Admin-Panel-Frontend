'use client';
import React, { useState } from 'react';
import { Blog, BlogComment } from '../types/blog.types';
import { BlogPreview } from './BlogPreview';
import {
  ThumbsUp,
  MessageCircle,
  Eye,
  Calendar,
  User,
  Clock,
  ExternalLink,
  ShieldCheck,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import Button from '@/components/ui/button/Button';
import InputField from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';

interface BlogDetailsViewProps {
  blog: Blog;
  comments: BlogComment[];
  commentMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  commentFilter: string;
  onFilterChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onUpdateCommentStatus: (
    commentId: string,
    status: 'Pending' | 'Approved' | 'Rejected',
  ) => Promise<void>;
  onLike: () => Promise<void>;
  onCreateComment: (data: {
    authorName: string;
    authorEmail: string;
    content: string;
  }) => Promise<void>;
  isCommentsLoading?: boolean;
}

export const BlogDetailsView: React.FC<BlogDetailsViewProps> = ({
  blog,
  comments,
  commentMeta,
  commentFilter,
  onFilterChange,
  onPageChange,
  onUpdateCommentStatus,
  onLike,
  onCreateComment,
  isCommentsLoading = false,
}) => {
  const [updatingComment, setUpdatingComment] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const toggleCommentExpand = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike();
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (
    dateString: string | undefined | null,
    options: Intl.DateTimeFormatOptions,
    isTime = false,
  ) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return isTime
      ? date.toLocaleString('en-US', options)
      : date.toLocaleDateString('en-US', options);
  };

  const { openModal, closeModal } = useGlobalModal();

  const handleAddCommentClick = () => {
    let formData = { authorName: '', authorEmail: '', content: '' };

    openModal({
      title: 'Add New Comment',
      description: 'Fill in the details below to post a comment on this blog.',
      content: (
        <div className="space-y-4">
          <InputField
            label="Name"
            placeholder="Enter author name"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              (formData.authorName = e.target.value)
            }
          />
          <InputField
            label="Email"
            placeholder="Enter author email"
            type="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              (formData.authorEmail = e.target.value)
            }
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Comment
            </label>
            <TextArea
              placeholder="Write your comment here..."
              rows={4}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                (formData.content = e.target.value)
              }
            />
          </div>
        </div>
      ),
      actions: (
        <div className="flex gap-3">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              if (!formData.authorName || !formData.authorEmail || !formData.content) {
                return;
              }
              await onCreateComment(formData);
              closeModal();
            }}
          >
            Post Comment
          </Button>
        </div>
      ),
    });
  };

  const handleStatusUpdate = async (
    commentId: string,
    status: 'Pending' | 'Approved' | 'Rejected',
  ) => {
    setUpdatingComment(commentId);
    try {
      await onUpdateCommentStatus(commentId, status);
    } finally {
      setUpdatingComment(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        {/* Blog Preview Card */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-theme-xl overflow-hidden border border-gray-100 dark:border-navy-800">
          <div className="p-6 border-b border-gray-100 dark:border-navy-800 flex items-center justify-between bg-gray-50/50 dark:bg-navy-800/50">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="text-brand-500" size={20} />
              Blog Preview
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
                  blog.isActive
                    ? 'bg-green-100 text-green-600 dark:bg-green-500/20'
                    : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20',
                )}
              >
                {blog.status}
              </span>
            </div>
          </div>
          <div className="p-8">
            <BlogPreview
              title={blog.title}
              content={blog.content}
              featureImage={blog.featureImage}
            />
          </div>
        </div>
      </div>

      {/* Sidebar Metrics & Meta */}
      <div className="space-y-8">
        {/* Engagement Stats */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-theme-xl overflow-hidden border border-gray-100 dark:border-navy-800 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="text-brand-500" size={20} />
            Engagement Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                'group/like bg-brand-50/50 dark:bg-brand-500/5 p-4 rounded-2xl border border-brand-100/50 dark:border-brand-500/10 text-left transition-all hover:border-brand-300 active:scale-95 disabled:opacity-50',
                isLiking && 'animate-pulse',
              )}
            >
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-2">
                <ThumbsUp size={16} className="group-hover/like:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Likes</span>
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {blog.engagement?.likes || 0}
              </span>
            </button>
            <div className="bg-blue-50/50 dark:bg-blue-500/5 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-500/10">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <Eye size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Views</span>
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {blog.engagement?.views || 0}
              </span>
            </div>
            <div className="col-span-2 bg-orange-50/50 dark:bg-orange-500/5 p-4 rounded-2xl border border-orange-100/50 dark:border-orange-500/10">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                <MessageCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Comments</span>
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {blog.engagement?.commentsCount || comments.length}
              </span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-theme-xl overflow-hidden border border-gray-100 dark:border-navy-800 flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-navy-800 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="text-brand-500" size={20} />
              Comments
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddCommentClick}
                className="p-1.5 bg-brand-50 text-brand-600 dark:bg-brand-500/10 rounded-lg hover:bg-brand-100 transition-colors"
                title="Add Comment"
              >
                <Plus size={14} />
              </button>
              <span className="bg-gray-50 text-gray-600 dark:bg-navy-800 px-2 py-1 rounded-full text-[10px] font-bold">
                {commentMeta.total}
              </span>
            </div>
          </div>

          {/* Comment Status Filter Tabs */}
          <div className="px-6 py-3 bg-gray-50/50 dark:bg-navy-800/50 border-b border-gray-100 dark:border-navy-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => onFilterChange(status)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                  commentFilter === status
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-800 border border-gray-100 dark:border-navy-800',
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-100 dark:border-navy-800 max-h-[500px] overflow-y-auto relative min-h-[150px] flex-grow">
            {isCommentsLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-navy-900/60 flex items-center justify-center z-10 transition-opacity">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            )}
            {comments.length > 0 ? (
              comments.map((comment) => {
                const commentId = comment.id || comment._id || '';
                const CHAR_LIMIT = 150;
                const isLong = comment.content.length > CHAR_LIMIT;
                const isExpanded = !!expandedComments[commentId];
                const displayText =
                  isLong && !isExpanded
                    ? `${comment.content.substring(0, CHAR_LIMIT)}...`
                    : comment.content;

                return (
                  <div
                    key={commentId}
                    className="p-4 hover:bg-gray-50/50 dark:hover:bg-navy-800/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
                            {comment.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white text-xs truncate">
                              {comment.authorName}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(
                                comment.createdAt,
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                                true,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <select
                            disabled={updatingComment === commentId}
                            value={comment.status}
                            onChange={(e) =>
                              handleStatusUpdate(
                                commentId,
                                e.target.value as 'Pending' | 'Approved' | 'Rejected',
                              )
                            }
                            className={cn(
                              'px-2 py-1 text-[10px] font-black uppercase rounded-lg border outline-none cursor-pointer transition-all dark:bg-navy-900',
                              comment.status === 'Approved' &&
                                'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
                              comment.status === 'Rejected' &&
                                'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                              comment.status === 'Pending' &&
                                'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
                            )}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-navy-800/50 p-2 rounded-lg break-words">
                          {displayText}
                        </p>
                        {isLong && (
                          <button
                            onClick={() => toggleCommentExpand(commentId)}
                            className="text-[10px] font-bold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 outline-none select-none transition-colors px-1"
                          >
                            {isExpanded ? 'Show less' : 'Read full comment'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[150px]">
                <MessageCircle size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  No comments yet
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {commentMeta.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between bg-gray-50/30 dark:bg-navy-800/20">
              <button
                disabled={commentMeta.page <= 1}
                onClick={() => onPageChange(commentMeta.page - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-hover"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Page {commentMeta.page} of {commentMeta.totalPages}
              </span>
              <button
                disabled={commentMeta.page >= commentMeta.totalPages}
                onClick={() => onPageChange(commentMeta.page + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-hover"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Metadata Card */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-theme-xl overflow-hidden border border-gray-100 dark:border-navy-800 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Meta Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-navy-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600">
                  <User size={16} />
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {(blog.author as { name?: string })?.name || 'Admin'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-navy-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600">
                  <Calendar size={16} />
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created At
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatDate(blog.createdAt, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-navy-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600">
                  <ExternalLink size={16} />
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slug
                </span>
              </div>
              <span
                className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]"
                title={blog.slug}
              >
                {blog.slug}
              </span>
            </div>
          </div>
        </div>

        {/* SEO Quick View */}
        <div className="bg-navy-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <h3 className="font-bold mb-4 relative z-10 flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-400" />
            SEO Stats
          </h3>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center text-sm">
              <span className="text-navy-300">Title Length</span>
              <span
                className={cn(
                  'font-bold',
                  (blog.seo?.metaTitle?.length || 0) > 60 ? 'text-orange-400' : 'text-green-400',
                )}
              >
                {blog.seo?.metaTitle?.length || 0} chars
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-navy-300">Keywords</span>
              <span className="font-bold text-brand-400">{blog.seo?.keywords?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
