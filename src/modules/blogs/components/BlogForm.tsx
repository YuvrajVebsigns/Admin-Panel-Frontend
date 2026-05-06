'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Globe, FileText, Search, Info } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { Blog, BlogContent } from '../types/blog.types';
import { useBlogs } from '../hooks/useBlogs';
import { useWebsites } from '@/modules/websites/hooks/useWebsites';
import Editor from '@/components/ui/editor/Editor';
import Badge from '@/components/ui/badge/Badge';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  excerpt: z.string().optional(),
  isActive: z.boolean(),
  websites: z.array(z.string()).min(1, 'Select at least one website'),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      canonicalUrl: z.string().optional(),
      ogImage: z.string().optional(),
    })
    .optional(),
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
  const [content, setContent] = React.useState<BlogContent | null>(initialData?.content || null);

  const handleEditorChange = React.useCallback((data: import('@editorjs/editorjs').OutputData) => {
    setContent(data as unknown as BlogContent);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          excerpt: initialData.excerpt,
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
          websites: initialData.websites.map((w) =>
            typeof w === 'string' ? w : ((w.id || w._id) as string),
          ),
          seo: initialData.seo,
        }
      : {
          title: '',
          excerpt: '',
          isActive: false,
          websites: defaultWebsiteId ? [defaultWebsiteId] : [],
          seo: {
            keywords: [],
          },
        },
  });

  const selectedWebsites = watch('websites');

  const onSubmit = async (data: BlogFormData) => {
    if (!content) {
      alert('Please add some content to your blog');
      return;
    }

    try {
      const payload = { ...data, content };
      if (isEdit && initialData) {
        await updateBlog({ id: initialData.id, data: payload });
      } else {
        await createBlog(payload as unknown as Parameters<typeof createBlog>[0]);
      }
      router.push('/blogs');
    } catch (error) {
      // Toast handled in hook
    }
  };

  const toggleWebsite = (id: string) => {
    const current = [...selectedWebsites];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setValue('websites', current, { shouldValidate: true });
  };

  return (
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
          <Badge color={watch('isActive') ? 'success' : 'warning'}>
            {watch('isActive') ? 'PUBLISHED' : 'DRAFT'}
          </Badge>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isCreating || isUpdating}
            className="shadow-lg shadow-brand-500/20"
          >
            {isCreating || isUpdating ? (
              'Saving...'
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {isEdit ? 'Update Blog' : 'Publish Blog'}
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
                <input
                  id="title"
                  {...register('title')}
                  placeholder="Enter a catchy title..."
                  className={`w-full px-5 py-3.5 bg-gray-50 dark:bg-navy-900 border ${
                    errors.title ? 'border-error-500' : 'border-gray-100 dark:border-navy-700'
                  } rounded-2xl focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-bold text-lg`}
                />
                {errors.title && (
                  <p className="text-xs text-error-500 mt-1">{errors.title.message}</p>
                )}
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

          {/* Content Editor Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={20} className="text-brand-500" />
                Content Editor
              </h3>
              <span className="text-xs text-gray-400 font-medium italic">Auto-saves locally</span>
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

        {/* Right Column: Settings & SEO */}
        <div className="space-y-8">
          {/* Publication Settings */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe size={20} className="text-brand-500" />
              Publication
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Select Platforms</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
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
                          <img src={website.logo} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-brand-500">
                            {website.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
                        {website.name}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.websites && (
                  <p className="text-xs text-error-500">{errors.websites.message}</p>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-50 dark:border-navy-700">
                <Label htmlFor="isActive">Publishing Status</Label>
                <Select
                  value={watch('isActive') ? 'PUBLISHED' : 'DRAFT'}
                  onChange={(val) => setValue('isActive', val === 'PUBLISHED')}
                  options={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'PUBLISHED', label: 'Published' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* SEO Card */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Search size={20} className="text-brand-500" />
              SEO Optimizer
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seo.metaTitle">Meta Title</Label>
                <Input id="seo.metaTitle" {...register('seo.metaTitle')} placeholder="SEO Title" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
