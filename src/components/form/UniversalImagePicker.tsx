'use client';

import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Globe,
  Search,
  X,
  Loader2,
  Video,
  ArrowLeft,
} from 'lucide-react';
import { useFiles } from '@/modules/media/hooks/useFiles';
import { FileBrowser } from '@/modules/media/components/FileBrowser';
import { FileData } from '@/modules/media/types/file.types';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { AssetMetadataForm } from '@/modules/media/components/AssetMetadataForm';
import TagInput from '@/components/form/input/TagInput';

interface UniversalImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
  onSelect?: (file: FileData | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  module?: string;
}

type PickerStep =
  | 'closed'
  | 'selector'
  | 'library'
  | 'upload_details'
  | 'url_details'
  | 'youtube_details';

/** Inline image and video picker. Forms never open a modal to add media. */
export const UniversalImagePicker: React.FC<UniversalImagePickerProps> = ({
  value,
  onChange,
  onSelect,
  label,
  placeholder = 'Select Image',
  className,
  aspectRatio = 'video',
  module = 'media',
}) => {
  const { uploadFile, isUploading } = useFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<PickerStep>('closed');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState(module);
  const [visibility, setVisibility] = useState('public');

  const resetPicker = () => {
    setStep('closed');
    setFile(null);
    setUrl('');
    setAlt('');
    setKeywords([]);
    setSelectedModule(module);
    setVisibility('public');
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStep('upload_details');
    }
  };
  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!url && !file) return;
    const formData = new FormData();
    if (file && step === 'upload_details') formData.append('file', file);
    else if (url) formData.append('url', url);
    else return;
    formData.append('module', selectedModule);
    formData.append('visibility', visibility);
    formData.append('alt', alt || 'Media asset');
    keywords.forEach((keyword) => formData.append('keywords[]', keyword));
    formData.append('entityType', 'manual_upload');
    formData.append('entityId', 'none');
    try {
      const response = await uploadFile(formData);
      onChange(response.url || '');
      onSelect?.(response);
      resetPicker();
      toast.success('Asset added successfully');
    } catch {
      toast.error('Failed to process asset');
    }
  };
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: 'aspect-auto min-h-[200px]',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      )}
      <div
        className={cn(
          'group relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-gray-50 dark:bg-navy-900/50',
          aspectClasses[aspectRatio],
          value
            ? 'border-transparent'
            : 'border-gray-200 hover:border-brand-400 dark:border-navy-700',
        )}
      >
        {value ? (
          <>
            <img src={value} alt="Selected asset" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <button
                type="button"
                onClick={() => setStep('selector')}
                className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-600"
              >
                Change image
              </button>
              <button
                type="button"
                aria-label="Remove selected asset"
                onClick={() => {
                  onChange('');
                  onSelect?.(null);
                }}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-error-600"
              >
                <X size={18} />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setStep('selector')}
            className="flex h-full w-full flex-col items-center justify-center gap-3 text-gray-400 hover:text-brand-500"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-navy-800">
              {isUploading ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <ImageIcon size={28} />
              )}
            </div>
            <span className="text-sm font-bold">{placeholder}</span>
          </button>
        )}
      </div>
      {step !== 'closed' && (
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Add media</p>
              <p className="text-xs text-gray-500">This workspace stays in the current form.</p>
            </div>
            <button
              type="button"
              onClick={resetPicker}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white dark:hover:bg-navy-800"
              aria-label="Close media picker"
            >
              <X size={18} />
            </button>
          </div>
          {step === 'selector' && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-400 dark:border-navy-700 dark:bg-navy-900"
              >
                <Upload className="text-brand-500" size={22} />
                <span>
                  <strong className="block text-sm text-gray-900 dark:text-white">Upload</strong>
                  <small className="text-xs text-gray-500">From device</small>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep('library')}
                className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-400 dark:border-navy-700 dark:bg-navy-900"
              >
                <Search className="text-brand-500" size={22} />
                <span>
                  <strong className="block text-sm text-gray-900 dark:text-white">Library</strong>
                  <small className="text-xs text-gray-500">Existing asset</small>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep('url_details')}
                className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-400 dark:border-navy-700 dark:bg-navy-900"
              >
                <Globe className="text-brand-500" size={22} />
                <span>
                  <strong className="block text-sm text-gray-900 dark:text-white">URL</strong>
                  <small className="text-xs text-gray-500">External image</small>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep('youtube_details')}
                className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-400 dark:border-navy-700 dark:bg-navy-900"
              >
                <Video className="text-brand-500" size={22} />
                <span>
                  <strong className="block text-sm text-gray-900 dark:text-white">YouTube</strong>
                  <small className="text-xs text-gray-500">Add a video</small>
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
          )}
          {step === 'library' && (
            <>
              <button
                type="button"
                onClick={() => setStep('selector')}
                className="inline-flex min-h-9 items-center gap-2 text-xs font-bold text-brand-600"
              >
                <ArrowLeft size={15} /> Back to sources
              </button>
              <FileBrowser
                initialFileType="image"
                onSelect={(selected) => {
                  onChange(selected.url || '');
                  onSelect?.(selected);
                  resetPicker();
                }}
              />
            </>
          )}
          {step === 'youtube_details' && (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                YouTube video URL
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-navy-700 dark:bg-navy-900"
                />
              </label>
              <label className="block text-sm font-bold text-gray-900 dark:text-white">
                Video title
                <input
                  type="text"
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  placeholder="Optional title"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-navy-700 dark:bg-navy-900"
                />
              </label>
              <TagInput defaultValue={keywords} onChange={setKeywords} placeholder="Add tags" />
              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-navy-700">
                <button
                  type="button"
                  onClick={() => setStep('selector')}
                  className="min-h-10 rounded-lg px-4 text-sm font-bold text-gray-600"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!url || isUploading}
                  onClick={() => handleSubmit()}
                  className="min-h-10 rounded-lg bg-brand-500 px-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  {isUploading ? 'Adding…' : 'Add YouTube video'}
                </button>
              </div>
            </div>
          )}
          {(step === 'upload_details' || step === 'url_details') && (
            <AssetMetadataForm
              step={step === 'upload_details' ? 'upload' : 'url'}
              file={file}
              url={url}
              setUrl={setUrl}
              alt={alt}
              setAlt={setAlt}
              keywords={keywords}
              setKeywords={setKeywords}
              module={selectedModule}
              setModule={setSelectedModule}
              visibility={visibility}
              setVisibility={setVisibility}
              onBack={() => setStep('selector')}
              onSubmit={handleSubmit}
              isProcessing={isUploading}
              submitLabel="Add asset"
            />
          )}
        </div>
      )}
    </div>
  );
};
