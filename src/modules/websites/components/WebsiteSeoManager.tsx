'use client';
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWebsites, useWebsite } from '../hooks/useWebsites';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import TagInput from '@/components/form/input/TagInput';
import Button from '@/components/ui/button/Button';
import { Loader2, Save, Info } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

const seoFormSchema = z.object({
  seo: z.object({
    metaTitle: z.string().optional().or(z.literal('')),
    metaDescription: z.string().optional().or(z.literal('')),
    metaKeywords: z.array(z.string()).default([]),
    ogImage: z.string().optional().or(z.literal('')),
  }),
});

type SeoFormData = z.infer<typeof seoFormSchema>;

interface WebsiteSeoManagerProps {
  siteId: string;
}

export const WebsiteSeoManager: React.FC<WebsiteSeoManagerProps> = ({ siteId }) => {
  const { website, isLoading } = useWebsite(siteId);
  const { updateWebsite, isUpdating } = useWebsites();

  const { register, handleSubmit, setValue, control } = useForm<SeoFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(seoFormSchema) as any,
    defaultValues: {
      seo: {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: [],
        ogImage: '',
      },
    },
  });

  // Sync with loaded website data
  useEffect(() => {
    if (website) {
      setValue('seo.metaTitle', website.seo?.metaTitle || '');
      setValue('seo.metaDescription', website.seo?.metaDescription || '');
      setValue('seo.metaKeywords', website.seo?.metaKeywords || []);
      setValue('seo.ogImage', getImageUrl(website.seo?.ogImage) || '');
    }
  }, [website, setValue]);

  const onSubmit = async (data: SeoFormData) => {
    if (!website) return;
    try {
      await updateWebsite({
        id: website.id,
        data: {
          name: website.name,
          slug: website.slug,
          domain: website.domain,
          logo: getImageUrl(website.logo) || '',
          description: website.description || '',
          isActive: website.isActive,
          seo: data.seo,
        },
      });
    } catch (e) {}
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm font-semibold text-gray-400">Loading website SEO configs...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Informative Header Alert */}
      <div className="flex items-start gap-3 p-4 bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/30 rounded-2xl">
        <Info size={20} className="text-brand-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-brand-900 dark:text-brand-400">
            Global Search Engine Configurations
          </h4>
          <p className="text-xs text-brand-600 dark:text-brand-500 mt-0.5">
            Configure global defaults for search engine indexers and social networks (Facebook,
            Twitter, LinkedIn sharing). Individual pages can override these parameters inside their
            respective details.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-700 overflow-hidden shadow-theme-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="globalMetaTitle" className="font-bold text-gray-800 dark:text-gray-200">
              Default Site Meta Title
            </Label>
            <Input
              id="globalMetaTitle"
              placeholder="Title tag displayed on the root index page"
              {...register('seo.metaTitle')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="globalOgImage" className="font-bold text-gray-800 dark:text-gray-200">
              Default OpenGraph Image URL
            </Label>
            <Input
              id="globalOgImage"
              placeholder="Social sharing preview link"
              {...register('seo.ogImage')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="globalMetaDescription"
            className="font-bold text-gray-800 dark:text-gray-200"
          >
            Default Site Meta Description
          </Label>
          <TextArea
            id="globalMetaDescription"
            placeholder="Overview snippet loaded by crawler indexers"
            rows={4}
            {...register('seo.metaDescription')}
          />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-gray-800 dark:text-gray-200">
            Global Property Tags / Keywords
          </Label>
          <Controller
            name="seo.metaKeywords"
            control={control}
            render={({ field }) => (
              <TagInput
                placeholder="Add site-wide keyword..."
                defaultValue={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {/* Save Trigger */}
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          startIcon={
            isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />
          }
          disabled={isUpdating}
        >
          {isUpdating ? 'Saving Configurations...' : 'Save Configurations'}
        </Button>
      </div>
    </form>
  );
};
