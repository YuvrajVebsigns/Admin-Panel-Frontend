'use client';
import React, { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Search } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import TagInput from '@/components/form/input/TagInput';
import Button from '@/components/ui/button/Button';
import { useWebsites } from '../hooks/useWebsites';
import { Website } from '../types/website.types';

const websiteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  domain: z
    .string()
    .regex(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
      'Invalid domain format (e.g., example.com or https://example.com)',
    ),
  logo: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  seo: z.object({
    metaTitle: z.string().optional().or(z.literal('')),
    metaDescription: z.string().optional().or(z.literal('')),
    metaKeywords: z.string().array().optional().default([]),
    ogImage: z.string().optional().or(z.literal('')),
  }),
});

type WebsiteFormData = z.infer<typeof websiteSchema>;

interface WebsiteFormProps {
  initialData?: Website | null;
}

export const WebsiteForm: React.FC<WebsiteFormProps> = ({ initialData }) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const { createWebsite, updateWebsite, isCreating, isUpdating } = useWebsites();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<WebsiteFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(websiteSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          domain: initialData.domain,
          logo: initialData.logo || '',
          description: initialData.description || '',
          isActive: initialData.isActive,
          seo: {
            metaTitle: initialData.seo?.metaTitle || '',
            metaDescription: initialData.seo?.metaDescription || '',
            metaKeywords: initialData.seo?.metaKeywords || [],
            ogImage: initialData.seo?.ogImage || '',
          },
        }
      : {
          name: '',
          slug: '',
          domain: '',
          logo: '',
          description: '',
          isActive: true,
          seo: {
            metaTitle: '',
            metaDescription: '',
            metaKeywords: [],
            ogImage: '',
          },
        },
  });

  const nameValue = useWatch({ control, name: 'name' });

  useEffect(() => {
    if (!isEdit && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [nameValue, isEdit, setValue]);

  const onSubmit = async (data: WebsiteFormData) => {
    try {
      if (isEdit && initialData) {
        await updateWebsite({ id: initialData.id, data });
      } else {
        await createWebsite(data);
      }
      router.push('/websites');
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-9 w-9 p-0">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Website' : 'Add New Website'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEdit
              ? 'Update website configuration and SEO settings'
              : 'Configure a new website for your network'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-800/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                <Globe size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Information
              </h2>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Website Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Corporate Site"
                  {...register('name')}
                  error={!!errors.name}
                  hint={errors.name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Website Slug <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="e.g., corporate-site"
                  {...register('slug')}
                  error={!!errors.slug}
                  hint={errors.slug?.message}
                  disabled={isEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">
                  Primary Domain <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="domain"
                  placeholder="e.g., https://example.com"
                  {...register('domain')}
                  error={!!errors.domain}
                  hint={errors.domain?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  placeholder="e.g., https://example.com/logo.png"
                  {...register('logo')}
                  error={!!errors.logo}
                  hint={errors.logo?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Website Description</Label>
              <TextArea
                id="description"
                placeholder="Tell us about this website..."
                rows={4}
                {...register('description')}
                error={!!errors.description}
                hint={errors.description?.message}
              />
            </div>

            {/* <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <Label htmlFor="isActive" className="mb-0 cursor-pointer">
                Active Website
              </Label>
            </div> */}
          </div>
        </div>

        {/* SEO & Social Meta Section */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-gray-100 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-800/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Search size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                SEO & Social Meta
              </h2>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  placeholder="Page title for search engines"
                  {...register('seo.metaTitle')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogImage">OG Image (Social Sharing)</Label>
                <Input
                  id="ogImage"
                  placeholder="URL for social share preview image"
                  {...register('seo.ogImage')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <TextArea
                id="metaDescription"
                placeholder="Summary for search results..."
                rows={4}
                {...register('seo.metaDescription')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Keywords (Press Tab or Enter to add)</Label>
              <Controller
                name="seo.metaKeywords"
                control={control}
                render={({ field }) => (
                  <TagInput
                    id="metaKeywords"
                    placeholder="e.g., media, news, blogs"
                    defaultValue={field.value}
                    onChange={field.onChange}
                    error={!!errors.seo?.metaKeywords}
                    hint={errors.seo?.metaKeywords?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-800 p-6 shadow-sm flex justify-end gap-3 sticky bottom-6 z-10">
          <Button type="button" variant="outline" onClick={() => router.push('/websites')}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isCreating || isUpdating}
            className="bg-primary-600 hover:bg-primary-700 text-white min-w-[120px]"
          >
            {isEdit ? 'Update Website' : 'Create Website'}
          </Button>
        </div>
      </form>
    </div>
  );
};
