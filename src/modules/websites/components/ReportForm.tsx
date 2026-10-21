'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, FileText, CheckCircle } from 'lucide-react';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import Switch from '@/components/form/switch/Switch';
import Button from '@/components/ui/button/Button';
import { UniversalFilePicker } from '@/components/form/UniversalFilePicker';
import { useWebsites } from '../hooks/useWebsites';
import { FileData } from '@/modules/media/types/file.types';
import { fileService } from '@/modules/media/services/file.service';
import { Report } from '../types/cms.types';
import toast from 'react-hot-toast';

const reportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().optional().or(z.literal('')),
  fileId: z.string().min(1, 'Please select or upload a document file'),
  websiteId: z.string().optional().or(z.literal('')),
  isPublished: z.boolean(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  initialData?: Report | null;
  defaultWebsiteId?: string | null;
  onSubmitReport: (data: Partial<Report>) => Promise<void>;
  isSubmitting: boolean;
  backUrl: string;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  initialData,
  defaultWebsiteId,
  onSubmitReport,
  isSubmitting,
  backUrl,
}) => {
  const router = useRouter();
  const isEdit = !!initialData;
  const { websites } = useWebsites({ limit: 100 });
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          description: initialData.description || '',
          fileId: initialData.fileId,
          websiteId: initialData.websiteId || '',
          isPublished: initialData.isPublished,
        }
      : {
          title: '',
          slug: '',
          description: '',
          fileId: '',
          websiteId: defaultWebsiteId || '',
          isPublished: true,
        },
  });

  const titleValue = watch('title');

  // Auto-slugification on title change (only on create)
  useEffect(() => {
    if (!isEdit && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [titleValue, isEdit, setValue]);

  // Load selected file details if initialData is provided
  useEffect(() => {
    if (initialData?.fileId) {
      fileService.getFiles({ search: initialData.fileId }).then((res) => {
        if (res.files && res.files.length > 0) {
          setSelectedFile(res.files[0] || null);
        }
      });
    }
  }, [initialData]);

  // Display validation errors
  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const errorList = errorKeys
        .map((field) => {
          const err = errors[field as keyof typeof errors];
          return `${field}: ${err?.message || 'Invalid field'}`;
        })
        .join(', ');
      toast.error(`Please correct errors: ${errorList}`);
    }
  }, [errors]);

  const onSubmit = async (data: ReportFormData) => {
    try {
      const payload: Partial<Report> = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        fileId: data.fileId,
        isPublished: data.isPublished,
        websiteId: data.websiteId || undefined,
      };
      await onSubmitReport(payload);
      router.push(backUrl);
    } catch (error) {
      // Handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-500 transition-colors font-medium group text-sm"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to Reports
        </button>

        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={isSubmitting} className="shadow-lg shadow-brand-500/20">
            <CheckCircle size={18} className="mr-2" />
            {isEdit ? 'Update Report' : 'Save Report'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={20} className="text-brand-500" />
              Report Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter report title..."
                className="text-lg font-semibold py-5 px-5 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="url-slug-here"
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                {...register('description')}
                placeholder="Tell us what this report is about..."
                rows={5}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none resize-none text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right Column: PDF Asset and Status */}
        <div className="space-y-6">
          {/* Document Attachment */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">
              ATTACHMENT
            </h3>

            <Controller
              name="fileId"
              control={control}
              render={({ field }) => (
                <UniversalFilePicker
                  label="Document File (PDF/Doc)"
                  value={field.value}
                  onChange={field.onChange}
                  fileName={selectedFile?.originalName}
                  onSelect={(file) => {
                    setSelectedFile(file);
                    setValue('fileId', file?.id || '');
                  }}
                  module="reports"
                  placeholder="Click to upload/select report"
                />
              )}
            />
          </div>

          {/* Publication Settings */}
          <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">
              SETTINGS
            </h3>

            {/* Target Website */}
            <div className="space-y-2">
              <Label htmlFor="websiteId">Target Website</Label>
              <select
                id="websiteId"
                {...register('websiteId')}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-navy-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white"
              >
                <option value="">Global / No Specific Website</option>
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-900 rounded-2xl border border-gray-100 dark:border-navy-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Publish</p>
                  <p className="text-[10px] text-gray-500">Visible on site</p>
                </div>
              </div>
              <Controller
                name="isPublished"
                control={control}
                render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
