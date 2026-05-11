'use client';

import React from 'react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import TagInput from '@/components/form/input/TagInput';
import { Loader2, Image as ImageIcon, File as FileIcon, Video as VideoIcon } from 'lucide-react';
import { FileData } from '../types/file.types';

interface AssetMetadataFormProps {
  step: 'upload' | 'url' | 'edit';
  file?: File | null;
  url?: string;
  existingFile?: FileData;
  setUrl?: (val: string) => void;
  alt: string;
  setAlt: (val: string) => void;
  keywords: string[];
  setKeywords: (tags: string[]) => void;
  module: string;
  setModule: (val: string) => void;
  visibility: string;
  setVisibility: (val: string) => void;
  onBack: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  isProcessing: boolean;
  submitLabel?: string;
}

const MODULE_OPTIONS = [
  { value: 'media', label: 'Media Library' },
  { value: 'blogs', label: 'Blogs' },
  { value: 'websites', label: 'Websites' },
  { value: 'events', label: 'Events' },
  { value: 'documents', label: 'Documents' },
  { value: 'branding', label: 'Branding' },
];

export const AssetMetadataForm: React.FC<AssetMetadataFormProps> = ({
  step,
  file,
  url,
  existingFile,
  setUrl,
  alt,
  setAlt,
  keywords,
  setKeywords,
  module,
  setModule,
  visibility,
  setVisibility,
  onBack,
  onSubmit,
  isProcessing,
  submitLabel = 'Start Upload',
}) => {
  return (
    <div className="space-y-6">
      {/* File Preview Card */}
      <div className="bg-gray-50 dark:bg-navy-900/50 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-navy-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-gray-100 dark:border-navy-700">
          {step === 'upload' && file?.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : step === 'url' &&
            url &&
            (url.startsWith('data:image') || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url)) ? (
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
          ) : step === 'edit' &&
            existingFile &&
            (existingFile.mimeType.startsWith('image/') || existingFile.fileType === 'image') ? (
            <img
              src={existingFile.urlVariants?.thumbnail || existingFile.url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-brand-600">
              {step === 'upload' && !file?.type.startsWith('image/') ? (
                <FileIcon size={24} />
              ) : step === 'edit' && existingFile?.fileType === 'video' ? (
                <VideoIcon size={24} />
              ) : (
                <ImageIcon size={24} />
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {step === 'upload'
              ? file?.name
              : step === 'edit'
                ? existingFile?.originalName
                : 'External Asset'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {step === 'upload'
              ? `${(file!.size / (1024 * 1024)).toFixed(2)} MB`
              : step === 'edit'
                ? `${(existingFile!.size / (1024 * 1024)).toFixed(2)} MB`
                : url || 'No URL provided'}
          </p>
        </div>
        {step !== 'edit' && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-brand-600 hover:underline px-3 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-lg"
          >
            Change
          </button>
        )}
      </div>

      <div className="space-y-4">
        {step === 'url' && (
          <Input
            label="Source URL"
            placeholder="https://example.com/image.jpg"
            value={url || ''}
            onChange={(e) => setUrl && setUrl(e.target.value)}
            autoFocus
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Module"
            options={MODULE_OPTIONS}
            value={module}
            onChange={(val) => setModule(val)}
          />
          <Select
            label="Visibility"
            options={[
              { value: 'public', label: 'Public' },
              { value: 'private', label: 'Private' },
            ]}
            value={visibility}
            onChange={(val) => setVisibility(val)}
          />
        </div>

        <Input
          label="Alt Text / Description"
          placeholder="e.g. Summer blog hero image"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Keywords</label>
          <TagInput
            defaultValue={keywords}
            onChange={setKeywords}
            placeholder="Add tags (press Enter or comma)..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1 rounded-xl" type="button">
          Back
        </Button>
        <Button
          variant="primary"
          className="flex-1 rounded-xl shadow-lg shadow-brand-500/20"
          onClick={onSubmit}
          disabled={isProcessing || (step === 'url' && !url)}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              <span>Processing...</span>
            </div>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
};
