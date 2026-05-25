'use client';
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Switch from '@/components/form/switch/Switch';
import TextArea from '@/components/form/input/TextArea';
import TagInput from '@/components/form/input/TagInput';
import Button from '@/components/ui/button/Button';
import { PageType, PageStatus, WebsitePage } from '../types/cms.types';
import { useWebsitePages } from '../hooks/useWebsitePages';
import dynamicImport from 'next/dynamic';
import { Loader2, Info, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const Editor = dynamicImport(() => import('@/components/ui/editor/Editor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center border border-gray-100 dark:border-navy-700 rounded-2xl bg-white dark:bg-navy-900">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <span className="text-xs font-semibold">Loading editor...</span>
      </div>
    </div>
  ),
});

const pageSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(1, 'Slug is required'),
  shortDescription: z.string().optional().or(z.literal('')),
  pageType: z.nativeEnum(PageType),
  status: z.nativeEnum(PageStatus),
  isHomepage: z.boolean().default(false),
  seo: z.object({
    metaTitle: z.string().optional().or(z.literal('')),
    metaDescription: z.string().optional().or(z.literal('')),
    metaKeywords: z.array(z.string()).default([]),
    canonicalUrl: z.string().optional().or(z.literal('')),
    robots: z.string().optional().or(z.literal('')),
    ogTitle: z.string().optional().or(z.literal('')),
    ogDescription: z.string().optional().or(z.literal('')),
    twitterTitle: z.string().optional().or(z.literal('')),
    twitterDescription: z.string().optional().or(z.literal('')),
    schemaMarkup: z.string().optional().or(z.literal('')),
    noIndex: z.boolean().default(false),
    noFollow: z.boolean().default(false),
  }),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  pageData?: WebsitePage | null;
}

// Premium Tooltip Helper Component
const Tooltip: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="group relative inline-block ml-1.5 align-middle cursor-help select-none">
      <HelpCircle size={14} className="text-gray-400 hover:text-brand-500 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:flex flex-col items-center z-50">
        <div className="bg-gray-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-xl w-64 text-center leading-normal border border-gray-800/80">
          {content}
        </div>
        <div className="w-2.5 h-2.5 bg-gray-900 rotate-45 -mt-1.5" />
      </div>
    </div>
  );
};

export const PageFormModal: React.FC<PageFormModalProps> = ({
  isOpen,
  onClose,
  siteId,
  pageData,
}) => {
  const isEdit = !!pageData;
  const { createPage, updatePage, isCreating, isUpdating } = useWebsitePages({ siteId });
  const [activeTab, setActiveTab] = useState<'info' | 'editor' | 'seo'>('info');
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role?.roleKey === 'super_admin';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editorContent, setEditorContent] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<PageFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pageSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      shortDescription: '',
      pageType: PageType.STATIC_PAGE,
      status: PageStatus.DRAFT,
      isHomepage: false,
      seo: {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: [],
        canonicalUrl: '',
        robots: '',
        ogTitle: '',
        ogDescription: '',
        twitterTitle: '',
        twitterDescription: '',
        schemaMarkup: '',
        noIndex: false,
        noFollow: false,
      },
    },
  });

  const titleValue = watch('title');

  // Set default values when editing page data
  useEffect(() => {
    if (pageData) {
      setValue('title', pageData.title);
      setValue('slug', pageData.slug);
      setValue('shortDescription', pageData.shortDescription || '');
      setValue('pageType', pageData.pageType);
      setValue('status', pageData.status);
      setValue('isHomepage', pageData.isHomepage || false);

      const seo = pageData.seo || {};
      setValue('seo.metaTitle', seo.metaTitle || '');
      setValue('seo.metaDescription', seo.metaDescription || '');
      setValue('seo.metaKeywords', seo.metaKeywords || []);
      setValue('seo.canonicalUrl', seo.canonicalUrl || '');
      setValue('seo.robots', seo.robots || '');
      setValue('seo.ogTitle', seo.ogTitle || '');
      setValue('seo.ogDescription', seo.ogDescription || '');
      setValue('seo.twitterTitle', seo.twitterTitle || '');
      setValue('seo.twitterDescription', seo.twitterDescription || '');
      setValue('seo.schemaMarkup', seo.schemaMarkup || '');
      setValue('seo.noIndex', seo.noIndex || false);
      setValue('seo.noFollow', seo.noFollow || false);

      // Handle Editor content format
      if (pageData.content) {
        if (Array.isArray(pageData.content)) {
          setEditorContent({
            time: Date.now(),
            blocks: pageData.content,
            version: '2.29.1',
          });
        } else {
          setEditorContent(pageData.content);
        }
      } else {
        setEditorContent(null);
      }
    } else {
      // Clear values for create page
      setValue('title', '');
      setValue('slug', '');
      setValue('shortDescription', '');
      setValue('pageType', PageType.STATIC_PAGE);
      setValue('status', PageStatus.DRAFT);
      setValue('isHomepage', false);
      setValue('seo.metaTitle', '');
      setValue('seo.metaDescription', '');
      setValue('seo.metaKeywords', []);
      setValue('seo.canonicalUrl', '');
      setValue('seo.robots', '');
      setValue('seo.ogTitle', '');
      setValue('seo.ogDescription', '');
      setValue('seo.twitterTitle', '');
      setValue('seo.twitterDescription', '');
      setValue('seo.schemaMarkup', '');
      setValue('seo.noIndex', false);
      setValue('seo.noFollow', false);
      setEditorContent(null);
    }
    setActiveTab('info');
  }, [pageData, setValue, isOpen]);

  // Generate slug dynamically from title
  useEffect(() => {
    if (!isEdit && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [titleValue, isEdit, setValue]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorChange = (data: any) => {
    setEditorContent(data);
  };

  const onSubmit = async (data: PageFormData) => {
    const payload: Partial<WebsitePage> = {
      ...data,
      siteId,
      content: editorContent,
      sections: editorContent?.blocks
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          editorContent.blocks.map((block: any, idx: number) => ({
            type: block.type,
            order: idx,
            data: block.data,
          }))
        : [],
    };

    try {
      if (isEdit && pageData) {
        await updatePage({ id: pageData.id, data: payload });
      } else {
        await createPage(payload);
      }
      onClose();
    } catch (e) {
      // Handled by hook mutation onError
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Page Details' : 'Create Website Page'}
      size="5xl"
    >
      <div className="flex flex-col h-[80vh] overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 p-6 border-b border-gray-100 dark:border-navy-800">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border-none ${
              activeTab === 'info'
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent'
            }`}
          >
            General Details
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border-none ${
                activeTab === 'editor'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent'
              }`}
            >
              Page Section Builder
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border-none ${
              activeTab === 'seo'
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent'
            }`}
          >
            SEO Settings
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="pageTitle">Page Title</Label>
                    <Tooltip content="The public name of the page, e.g. 'Services' or 'Contact Us'." />
                  </div>
                  <Input
                    id="pageTitle"
                    placeholder="Enter page title (e.g. Services)"
                    {...register('title')}
                    error={errors.title?.message}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="urlSlug">URL Slug</Label>
                    <Tooltip content="The browser path URL for this page (e.g. '/services'). Homepage slugs are usually blank or '/'." />
                  </div>
                  <Input
                    id="urlSlug"
                    placeholder="Enter page slug (e.g. services)"
                    {...register('slug')}
                    error={errors.slug?.message}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Label>Page Template Type</Label>
                    <Tooltip content="Select the visual layout theme template. This dictates the theme rendering engine on the main website." />
                  </div>
                  <select
                    {...register('pageType')}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white"
                  >
                    <option value={PageType.STATIC_PAGE}>Static Content Page</option>
                    <option value={PageType.BLOG_PAGE}>Blog Landing Page</option>
                    <option value={PageType.LANDING_PAGE}>Featured Landing Page</option>
                    <option value={PageType.CUSTOM_PAGE}>Custom Schema Page</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Label>Publication Status</Label>
                    <Tooltip content="Set to Draft to hide this page during staging, Published to make it live, or Archived to take it offline." />
                  </div>
                  <select
                    {...register('status')}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-navy-400 dark:bg-[#0b1a32] dark:text-white"
                  >
                    <option value={PageStatus.DRAFT}>Draft</option>
                    <option value={PageStatus.PUBLISHED}>Published</option>
                    <option value={PageStatus.ARCHIVED}>Archived</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl dark:border-navy-700 col-span-2">
                  <div>
                    <div className="flex items-center">
                      <Label className="mb-0 font-bold">Set as Homepage</Label>
                      <Tooltip content="If enabled, this page will be loaded as the root index '/' landing page for the website domain." />
                    </div>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      Routes root URL "/" to this page
                    </span>
                  </div>
                  <Controller
                    name="isHomepage"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Tooltip content="A brief summary overview used for internal indexers, card previews, or general metadata." />
                  </div>
                  <TextArea
                    id="shortDescription"
                    placeholder="Enter short overview of this page..."
                    {...register('shortDescription')}
                    error={errors.shortDescription?.message}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {activeTab === 'editor' && isSuperAdmin && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/30 rounded-2xl">
                  <Info size={18} className="text-brand-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-600 dark:text-brand-500">
                    Use our block-based EditorJS builder below to structure your sections. These
                    blocks are saved as a structured layout that loads dynamically on your frontend.
                  </p>
                </div>
                <div className="border border-gray-100 dark:border-navy-700 rounded-3xl p-4 bg-white dark:bg-navy-900 min-h-[400px]">
                  <Editor
                    data={editorContent}
                    onChange={handleEditorChange}
                    holder="page-section-editor"
                    mode="website"
                  />
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="seoMetaTitle">SEO Meta Title</Label>
                      <Tooltip content="The primary page title displayed in search engine results and browser tabs (Recommended length: 50-60 characters)." />
                    </div>
                    <Input
                      id="seoMetaTitle"
                      placeholder="Title tag displayed in search results..."
                      {...register('seo.metaTitle')}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="seoMetaDescription">SEO Meta Description</Label>
                      <Tooltip content="A concise overview summary shown under your title in search results (Recommended length: 150-160 characters)." />
                    </div>
                    <TextArea
                      id="seoMetaDescription"
                      placeholder="Summary snippet displayed in search result pages..."
                      {...register('seo.metaDescription')}
                      rows={3}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center">
                      <Label>Keywords / Tags</Label>
                      <Tooltip content="Relevant content tags and focus keyphrases to help search engine crawlers understand topic taxonomy." />
                    </div>
                    <Controller
                      name="seo.metaKeywords"
                      control={control}
                      render={({ field }) => (
                        <TagInput
                          placeholder="Type keyword and press Enter..."
                          defaultValue={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="canonicalUrl">Canonical URL</Label>
                      <Tooltip content="The preferred master URL address of this page, used by search engines to avoid duplicate content penalties." />
                    </div>
                    <Input
                      id="canonicalUrl"
                      placeholder="https://example.com/canonical-slug"
                      {...register('seo.canonicalUrl')}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="robotsDirectives">Robots Directives</Label>
                      <Tooltip content="Crawler indexing instructions, e.g. 'index, follow' to rank, or 'noindex, nofollow' to hide." />
                    </div>
                    <Input
                      id="robotsDirectives"
                      placeholder="e.g. index, follow"
                      {...register('seo.robots')}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="ogTitle">OpenGraph Title</Label>
                      <Tooltip content="The title loaded when sharing this page on Facebook, LinkedIn, or Slack preview cards." />
                    </div>
                    <Input
                      id="ogTitle"
                      placeholder="Social share card title..."
                      {...register('seo.ogTitle')}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="ogDescription">OpenGraph Description</Label>
                      <Tooltip content="The summary description shown inside social sharing card previews." />
                    </div>
                    <Input
                      id="ogDescription"
                      placeholder="Social share card description..."
                      {...register('seo.ogDescription')}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="twitterTitle">Twitter Card Title</Label>
                      <Tooltip content="Custom title optimized specifically for Twitter/X post cards." />
                    </div>
                    <Input
                      id="twitterTitle"
                      placeholder="Twitter feed card title..."
                      {...register('seo.twitterTitle')}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="twitterDescription">Twitter Card Description</Label>
                      <Tooltip content="Custom summary optimized specifically for Twitter/X post card snippets." />
                    </div>
                    <Input
                      id="twitterDescription"
                      placeholder="Twitter feed card description..."
                      {...register('seo.twitterDescription')}
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="schemaMarkup">JSON-LD Structured Schema Markup</Label>
                      <Tooltip content="Structured JSON schema script markup (e.g. FAQ, Article, local business schema) to produce rich snippets." />
                    </div>
                    <TextArea
                      id="schemaMarkup"
                      placeholder='{ "@context": "https://schema.org", "@type": "WebPage", ... }'
                      {...register('seo.schemaMarkup')}
                      rows={5}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl dark:border-navy-700">
                    <div>
                      <div className="flex items-center">
                        <Label className="mb-0 font-bold">Search Engine No-Index</Label>
                        <Tooltip content="Tells search crawlers not to include this page in search indexes (e.g. for private member dashboards)." />
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5 font-medium">
                        Request crawlers not to index this page
                      </span>
                    </div>
                    <Controller
                      name="seo.noIndex"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl dark:border-navy-700">
                    <div>
                      <div className="flex items-center">
                        <Label className="mb-0 font-bold">Search Engine No-Follow</Label>
                        <Tooltip content="Tells search crawlers not to follow or pass domain authority to any links on this page." />
                      </div>
                      <span className="text-xs text-gray-400 block mt-0.5 font-medium">
                        Instruct crawlers not to follow link relationships
                      </span>
                    </div>
                    <Controller
                      name="seo.noFollow"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-navy-800 bg-gray-50 dark:bg-navy-950/40 rounded-b-3xl">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? 'Saving Changes...'
                : isEdit
                  ? 'Update Page'
                  : 'Create Page'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
