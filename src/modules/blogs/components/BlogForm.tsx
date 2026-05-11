'use client';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Globe,
  FileText,
  Search,
  Info,
  Eye,
  MessageSquare,
  Lock,
  Mail,
  CheckCircle,
  RefreshCcw,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Switch from '@/components/form/switch/Switch';
import Button from '@/components/ui/button/Button';
import DateTimePicker from '@/components/form/date-picker';
import {
  Blog,
  BlogContent,
  BlogStatus,
  AutoArchiveDuration,
  CommentStrategy,
} from '../types/blog.types';
import { useBlogs } from '../hooks/useBlogs';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import Editor from '@/components/ui/editor/Editor';
import Badge from '@/components/ui/badge/Badge';
import { Modal } from '@/components/ui/modal';
import { BlogPreview } from './BlogPreview';
import TagInput from '@/components/form/input/TagInput';
import { UniversalImagePicker } from '@/components/form/UniversalImagePicker';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  excerpt: z.string().optional(),
  featureImage: z.string().optional().or(z.literal('')),
  featureImageId: z.string().optional(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  status: z.nativeEnum(BlogStatus),
  scheduledAt: z.string().optional().nullable(),
  autoArchiveDuration: z.nativeEnum(AutoArchiveDuration).optional().nullable(),
  commentStrategy: z.nativeEnum(CommentStrategy),
  invitedEmails: z.array(z.string().email('Invalid email address')).default([]),
  websites: z.array(z.string()).min(1, 'Select at least one website'),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).default([]),
      canonicalUrl: z.string().optional(),
      ogImage: z.string().optional(),
      ogImageId: z.string().optional(),
    })
    .optional(),
  isHyperlinked: z.boolean().default(false),
  hyperlinkWebsites: z.array(z.string()).default([]),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogFormProps {
  initialData?: Blog | null;
  defaultWebsiteId?: string | null;
}

export const BlogForm: React.FC<BlogFormProps> = ({ initialData, defaultWebsiteId }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const { websites } = useWebsites({ limit: 100 });
  const { createBlog, updateBlog, isCreating, isUpdating } = useBlogs();
  const [content, setContent] = React.useState<BlogContent | null>(() => {
    const rawContent = initialData?.content;
    if (Array.isArray(rawContent)) {
      return {
        time: Date.now(),
        blocks: rawContent,
        version: '2.29.1',
      } as unknown as BlogContent;
    }
    return (rawContent as unknown as BlogContent) || null;
  });
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(
    initialData?.updatedAt ? new Date(initialData.updatedAt) : null,
  );
  const [isAutoSaving, setIsAutoSaving] = React.useState(false);
  const isSavingRef = React.useRef(false);

  // Track values that have been saved to prevent redundant auto-saves
  const lastSavedTitleRef = React.useRef(initialData?.title || '');
  const lastSavedContentJsonRef = React.useRef(
    JSON.stringify(initialData?.content?.blocks || initialData?.content || []),
  );

  const handleEditorChange = React.useCallback((data: import('@editorjs/editorjs').OutputData) => {
    setContent(data as unknown as BlogContent);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          excerpt: initialData.excerpt,
          featureImage: initialData.featureImage || '',
          featureImageId: initialData.featureImageId,
          tags: initialData.tags || [],
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
          status: initialData.status || BlogStatus.DRAFT,
          scheduledAt: initialData.scheduledAt
            ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
            : null,
          autoArchiveDuration: initialData.autoArchiveDuration || null,
          commentStrategy: initialData.commentStrategy || CommentStrategy.PUBLIC,
          invitedEmails: initialData.invitedEmails || [],
          websites: initialData.websites.map((w) =>
            typeof w === 'string' ? w : ((w.id || w._id) as string),
          ),
          seo: initialData.seo,
          isHyperlinked: initialData.isHyperlinked || false,
          hyperlinkWebsites: (initialData.hyperlinkWebsites || []).map((w) =>
            typeof w === 'string' ? w : ((w.id || w._id) as string),
          ),
        }
      : {
          title: '',
          slug: '',
          excerpt: '',
          featureImage: '',
          featureImageId: '',
          tags: [],
          isActive: false,
          status: BlogStatus.DRAFT,
          scheduledAt: null,
          autoArchiveDuration: null,
          commentStrategy: CommentStrategy.PUBLIC,
          invitedEmails: [],
          websites: defaultWebsiteId ? [defaultWebsiteId] : [],
          seo: {
            keywords: [],
          },
          isHyperlinked: false,
          hyperlinkWebsites: [],
        },
  });

  const titleValue = watch('title');

  React.useEffect(() => {
    if (!isEdit && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [titleValue, isEdit, setValue]);

  const selectedWebsites = watch('websites') || [];
  const isHyperlinked = watch('isHyperlinked');
  const hyperlinkWebsites = watch('hyperlinkWebsites') || [];
  const watchedTitle = watch('title');

  // Auto-save logic
  const debouncedContent = useDebounce(content, 3000);
  const debouncedTitle = useDebounce(watchedTitle, 3000);

  React.useEffect(() => {
    const autoSave = async () => {
      // Only auto-save if we have an ID (already created)
      if (!isEdit || !initialData?.id || isSavingRef.current) return;

      // Check if values have actually changed from what was last saved/loaded
      const currentTitle = watchedTitle || '';
      const currentContentJson = JSON.stringify(content?.blocks || []);

      const hasTitleChanged = currentTitle !== lastSavedTitleRef.current;
      const hasContentChanged =
        currentContentJson !== lastSavedContentJsonRef.current && currentContentJson !== '[]';

      // Skip if nothing changed
      if (!hasTitleChanged && !hasContentChanged) return;

      // Debounce logic: only proceed if the debounced values match current values
      // This ensures we save the LATEST state after the user stops typing
      if (
        debouncedTitle !== currentTitle ||
        JSON.stringify(debouncedContent?.blocks || []) !== currentContentJson
      ) {
        return;
      }

      setIsAutoSaving(true);
      isSavingRef.current = true;
      try {
        const formData = watch();
        const payload = { ...formData, content: content as BlogContent };

        await updateBlog({
          id: initialData.id,
          data: payload as Parameters<typeof updateBlog>[0]['data'],
        });

        // Update tracking refs and UI
        lastSavedTitleRef.current = currentTitle;
        lastSavedContentJsonRef.current = currentContentJson;
        setLastSavedAt(new Date());
      } catch (_error) {
        // Auto-save failed silently
      } finally {
        setIsAutoSaving(false);
        isSavingRef.current = false;
      }
    };

    autoSave();
  }, [
    debouncedContent,
    debouncedTitle,
    watchedTitle,
    content,
    isEdit,
    initialData?.id,
    updateBlog,
    watch,
  ]);

  const onSubmit = async (data: BlogFormData, shouldRedirect = true) => {
    if (!content) {
      alert('Please add some content to your blog');
      return;
    }

    try {
      const payload = { ...data, content };
      if (isEdit && initialData) {
        await updateBlog({ id: initialData.id, data: payload });
        lastSavedTitleRef.current = watch('title');
        lastSavedContentJsonRef.current = JSON.stringify(content?.blocks || []);
        setLastSavedAt(new Date());
      } else {
        const result = await createBlog(payload as unknown as Parameters<typeof createBlog>[0]);
        if (result?.id) {
          // If we saved but didn't want to redirect, we should at least update the URL to edit mode
          if (!shouldRedirect) {
            router.replace(`/blogs/${result.id}/edit`);
          }
        }
      }

      if (shouldRedirect) {
        router.push('/blogs');
      }
    } catch (error) {
      // Toast handled in hook
    }
  };

  const toggleWebsite = (id: string) => {
    let current = [...selectedWebsites];
    const index = current.indexOf(id);

    if (isHyperlinked) {
      // In hyperlinking mode, it's single select
      current = [id];
      // Also remove from hyperlinking list if it was there
      const hIndex = hyperlinkWebsites.indexOf(id);
      if (hIndex > -1) {
        const newHyperlinkWebsites = [...hyperlinkWebsites];
        newHyperlinkWebsites.splice(hIndex, 1);
        setValue('hyperlinkWebsites', newHyperlinkWebsites);
      }
    } else {
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(id);
      }
    }
    setValue('websites', current, { shouldValidate: true });
  };

  const toggleHyperlinkWebsite = (id: string) => {
    const current = [...hyperlinkWebsites];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      // Cannot select if it's already the primary publication website
      if (selectedWebsites.includes(id)) return;
      current.push(id);
    }
    setValue('hyperlinkWebsites', current);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto pb-20">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => router.push('/blogs')}
            className="flex items-center gap-2 text-gray-500 hover:text-brand-500 transition-colors font-medium group text-sm"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Blogs
          </button>

          <div className="flex items-center gap-3">
            <Badge
              color={
                watch('status') === BlogStatus.PUBLISHED
                  ? 'success'
                  : watch('status') === BlogStatus.SCHEDULED
                    ? 'info'
                    : watch('status') === BlogStatus.ARCHIVED
                      ? 'error'
                      : 'warning'
              }
            >
              {watch('status').toUpperCase()}
            </Badge>

            {/* Manual Save Button */}
            <Button
              variant="outline"
              onClick={handleSubmit((data) => onSubmit(data as unknown as BlogFormData, false))}
              disabled={isCreating || isUpdating}
              className="bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700"
            >
              <Save size={18} className="mr-2" />
              {isCreating || isUpdating ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              onClick={handleSubmit((data) => onSubmit(data as unknown as BlogFormData, true))}
              disabled={isCreating || isUpdating}
              className="shadow-lg shadow-brand-500/20"
            >
              {isCreating || isUpdating ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle size={18} className="mr-2" />
                  {isEdit
                    ? 'Update & Exit'
                    : watch('status') === BlogStatus.SCHEDULED
                      ? 'Schedule'
                      : watch('status') === BlogStatus.ARCHIVED
                        ? 'Archive'
                        : 'Publish'}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Editor & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Info Card */}
            <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Info size={20} className="text-brand-500" />
                Blog Details
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Blog Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter blog title..."
                    className="text-xl font-bold py-6 px-6 bg-white dark:bg-navy-800 border-none shadow-sm focus:ring-0 rounded-2xl placeholder:text-gray-300"
                  />
                  {errors.title && (
                    <p className="text-xs text-error-500 mt-2 px-2">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="px-2">
                    URL Slug
                  </Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="url-slug-here"
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 transition-all outline-none text-sm font-medium"
                  />
                  {errors.slug && (
                    <p className="text-xs text-error-500 mt-1 px-2">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Controller
                    name="featureImage"
                    control={control}
                    render={({ field }) => (
                      <UniversalImagePicker
                        label="Featured Image"
                        value={field.value}
                        onChange={field.onChange}
                        onSelect={(file) => setValue('featureImageId', file?.id || '')}
                        aspectRatio="video"
                        module="blogs"
                        placeholder="Click to select featured image"
                      />
                    )}
                  />
                  {errors.featureImage && (
                    <p className="text-xs text-error-500 mt-1 px-2">
                      {errors.featureImage.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="px-2">
                    Blog Tags (Press Tab or Enter to add)
                  </Label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        id="tags"
                        placeholder="e.g., technology, lifestyle, tutorial"
                        defaultValue={field.value}
                        onChange={field.onChange}
                        error={!!errors.tags}
                        hint={errors.tags?.message}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Short Excerpt (Brief summary for cards)</Label>
                  <textarea
                    id="excerpt"
                    {...register('excerpt')}
                    rows={3}
                    placeholder="Summarize your blog in a few sentences..."
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Compact Discussion Row */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 px-6 py-4 shadow-sm transition-all hover:shadow-theme-md">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                      <MessageSquare size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Discussion & Comments
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Controller
                      name="commentStrategy"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-navy-900 rounded-xl border border-gray-100 dark:border-navy-700">
                          {[
                            { value: CommentStrategy.PUBLIC, label: 'Public', icon: Globe },
                            {
                              value: CommentStrategy.INVITE_ONLY,
                              label: 'Invite Only',
                              icon: Mail,
                            },
                            { value: CommentStrategy.DISABLED, label: 'Disabled', icon: Lock },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => field.onChange(opt.value)}
                              className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all',
                                field.value === opt.value
                                  ? 'bg-white dark:bg-navy-800 text-brand-500 shadow-sm border border-gray-100 dark:border-navy-700'
                                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200',
                              )}
                            >
                              <opt.icon size={10} />
                              {opt.label.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {watch('commentStrategy') === CommentStrategy.INVITE_ONLY && (
                  <div className="pt-2 border-t border-gray-50 dark:border-navy-700/50 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <Label
                        htmlFor="invitedEmails"
                        className="text-[10px] font-bold uppercase tracking-wider text-gray-400"
                      >
                        Whitelisted Email Addresses
                      </Label>
                    </div>
                    <Controller
                      name="invitedEmails"
                      control={control}
                      render={({ field }) => (
                        <TagInput
                          id="invitedEmails"
                          defaultValue={field.value}
                          onChange={field.onChange}
                          placeholder="Add email and press enter..."
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor Card */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={20} className="text-brand-500" />
                  Content Editor
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-navy-900 rounded-lg border border-gray-100 dark:border-navy-700">
                    {isAutoSaving ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-500 animate-pulse">
                        <RefreshCcw size={12} className="animate-spin" />
                        AUTO-SAVING...
                      </div>
                    ) : lastSavedAt ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <CheckCircle size={12} className="text-success-500" />
                        LAST SAVED AT{' '}
                        {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 italic">
                        NOT SAVED YET
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 transition-all text-xs font-bold shadow-sm"
                  >
                    <Eye size={16} />
                    PREVIEW BLOG
                  </button>
                </div>
              </div>
              <Editor
                data={
                  content
                    ? (content as unknown as import('@editorjs/editorjs').OutputData)
                    : undefined
                }
                onChange={handleEditorChange}
                placeholder="Start crafting your masterpiece..."
              />
            </div>
          </div>

          {/* Right Column: SEO & Publication */}
          <div className="space-y-8">
            {/* SEO Card */}
            <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Search size={20} className="text-brand-500" />
                SEO Optimizer
              </h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seo.metaTitle">Meta Title</Label>
                  <Input
                    id="seo.metaTitle"
                    {...register('seo.metaTitle')}
                    placeholder="SEO Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo.metaDescription">Meta Description</Label>
                  <textarea
                    id="seo.metaDescription"
                    {...register('seo.metaDescription')}
                    rows={4}
                    placeholder="Search engine snippet..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 transition-all outline-none resize-none text-xs font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="seo.ogImage"
                    control={control}
                    render={({ field }) => (
                      <UniversalImagePicker
                        label="OG Image (Social Sharing)"
                        value={field.value}
                        onChange={field.onChange}
                        onSelect={(file) => setValue('seo.ogImageId', file?.id || '')}
                        aspectRatio="video"
                        module="blogs"
                        placeholder="Click to select OG image"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo.keywords">Keywords (Press Tab or Enter to add)</Label>
                  <Controller
                    name="seo.keywords"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        id="seo.keywords"
                        placeholder="e.g., media, news, blogs"
                        defaultValue={field.value}
                        onChange={field.onChange}
                        error={!!errors.seo?.keywords}
                        hint={errors.seo?.keywords?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Publication Settings */}
            <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Globe size={20} className="text-brand-500" />
                Publication
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                      <Link2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Hyperlinking
                      </p>
                      <p className="text-[10px] text-gray-500">Cross-website link</p>
                    </div>
                  </div>
                  <Controller
                    name="isHyperlinked"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onChange={(checked) => {
                          field.onChange(checked);
                          if (checked && selectedWebsites.length > 1) {
                            // If enabling hyperlinking, keep only the first website
                            setValue('websites', [selectedWebsites[0] as string]);
                          }
                        }}
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center justify-between">
                    <span>{isHyperlinked ? 'Primary Platform' : 'Select Platforms'}</span>
                    {isHyperlinked && (
                      <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-md">
                        Single Select
                      </span>
                    )}
                  </Label>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {websites.map((website) => (
                      <label
                        key={website.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedWebsites.includes(website.id)
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
                            : 'border-gray-100 dark:border-navy-700 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedWebsites.includes(website.id)}
                          onChange={() => toggleWebsite(website.id)}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100 p-1 shrink-0">
                          {website.logo ? (
                            <img
                              src={website.logo}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-brand-500">
                              {website.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                          {website.name}
                        </span>
                        {selectedWebsites.includes(website.id) && (
                          <CheckCircle size={14} className="ml-auto text-brand-500" />
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.websites && (
                    <p className="text-xs text-error-500">{errors.websites.message}</p>
                  )}
                </div>

                {isHyperlinked && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="flex items-center gap-2">
                      <ExternalLink size={14} className="text-brand-500" />
                      Hyperlinking List
                    </Label>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {websites
                        .filter((w) => !selectedWebsites.includes(w.id))
                        .map((website) => (
                          <label
                            key={website.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              hyperlinkWebsites.includes(website.id)
                                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
                                : 'border-gray-100 dark:border-navy-700 hover:border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={hyperlinkWebsites.includes(website.id)}
                              onChange={() => toggleHyperlinkWebsite(website.id)}
                              className="hidden"
                            />
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100 p-1 shrink-0">
                              {website.logo ? (
                                <img
                                  src={website.logo}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-brand-500">
                                  {website.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                              {website.name}
                            </span>
                            {hyperlinkWebsites.includes(website.id) && (
                              <CheckCircle size={14} className="ml-auto text-brand-500" />
                            )}
                          </label>
                        ))}
                      {websites.filter((w) => !selectedWebsites.includes(w.id)).length === 0 && (
                        <p className="text-[10px] text-gray-400 italic text-center py-4">
                          No other websites available for hyperlinking
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {errors.websites && (
                  <p className="text-xs text-error-500">{errors.websites.message}</p>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-navy-700">
                <div className="space-y-2">
                  <Label htmlFor="status">Publishing Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="status"
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          // Sync isActive for backward compatibility if needed,
                          // though backend handles it via status
                          setValue('isActive', val === BlogStatus.PUBLISHED);
                        }}
                        options={[
                          { value: BlogStatus.DRAFT, label: 'Draft' },
                          { value: BlogStatus.PUBLISHED, label: 'Publish' },
                          { value: BlogStatus.SCHEDULED, label: 'Schedule' },
                          { value: BlogStatus.ARCHIVED, label: 'Archive' },
                        ]}
                      />
                    )}
                  />
                </div>

                {watch('status') === BlogStatus.SCHEDULED && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="scheduledAt" className="flex items-center gap-2">
                      <Calendar size={14} className="text-brand-500" />
                      Schedule Date & Time
                    </Label>
                    <Controller
                      name="scheduledAt"
                      control={control}
                      render={({ field }) => (
                        <DateTimePicker
                          id="scheduledAt"
                          showTime
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select date and time"
                          error={errors.scheduledAt?.message}
                        />
                      )}
                    />
                    <p className="text-[10px] text-gray-400 italic">
                      Blog will be published automatically at this time.
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Label htmlFor="autoArchiveDuration" className="flex items-center gap-2">
                    <Clock size={14} className="text-brand-500" />
                    Auto-Archive Duration
                  </Label>
                  <Controller
                    name="autoArchiveDuration"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="autoArchiveDuration"
                        value={field.value || 'none'}
                        onChange={(val) => field.onChange(val === 'none' ? null : val)}
                        options={[
                          { value: 'none', label: 'Never Archive' },
                          { value: AutoArchiveDuration.THREE_MONTHS, label: '3 Months' },
                          { value: AutoArchiveDuration.SIX_MONTHS, label: '6 Months' },
                          { value: AutoArchiveDuration.ONE_YEAR, label: '1 Year' },
                          { value: AutoArchiveDuration.THREE_YEARS, label: '3 Years' },
                        ]}
                      />
                    )}
                  />
                  <p className="text-[10px] text-gray-400 italic">
                    Blog will be archived automatically after this duration from publishing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Website Preview"
        size="2xl"
      >
        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar bg-white dark:bg-navy-950 rounded-b-3xl">
          <BlogPreview
            title={watch('title')}
            content={content}
            featureImage={initialData?.featureImage}
          />
        </div>
      </Modal>
    </>
  );
};
