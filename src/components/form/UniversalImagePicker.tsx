'use client';

import React from 'react';
import { Image as ImageIcon, Upload, Globe, Search, X, Loader2, Video } from 'lucide-react';
import { useGlobalModal } from '@/hooks/useGlobalModal';
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
  const { openModal, closeModal } = useGlobalModal();
  const { uploadFile, isUploading } = useFiles();

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: 'aspect-auto min-h-[200px]',
  };
  const openSourceSelector = () => {
    const openExistingBrowser = () => {
      openModal({
        title: 'Browse Image Library',
        size: '3xl',
        content: (
          <div className="max-h-[75vh] overflow-y-auto px-1">
            <FileBrowser
              initialFileType="image"
              onSelect={(file: FileData) => {
                onChange(file.url || '');
                onSelect?.(file);
                closeModal();
              }}
            />
          </div>
        ),
      });
    };

    const PickerModalContent = () => {
      const [step, setStep] = React.useState<
        'selector' | 'upload_details' | 'url_details' | 'youtube_details'
      >('selector');
      const [file, setFile] = React.useState<File | null>(null);
      const [url, setUrl] = React.useState('');
      const [alt, setAlt] = React.useState('');
      const [keywords, setKeywords] = React.useState<string[]>([]);
      const [modalModule, setModalModule] = React.useState(module);
      const [visibility, setVisibility] = React.useState('public');

      const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
          setFile(selectedFile);
          setStep('upload_details');
        }
      };

      const handleFinalSubmit = async () => {
        const formData = new FormData();
        if (step === 'upload_details' && file) {
          formData.append('file', file);
        } else if ((step === 'url_details' || step === 'youtube_details') && url) {
          formData.append('url', url);
        } else {
          return;
        }

        formData.append('module', modalModule);
        formData.append('visibility', visibility);
        formData.append('alt', alt || 'YouTube Video');

        keywords.forEach((k) => formData.append('keywords[]', k));

        formData.append('entityType', 'manual_upload');
        formData.append('entityId', 'none');

        try {
          const response = await uploadFile(formData);
          onChange(response.url || '');
          onSelect?.(response);
          closeModal();
          toast.success('Asset added successfully');
        } catch (error) {
          toast.error('Failed to process asset');
        }
      };

      if (step === 'selector') {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-6">
            <button
              onClick={() => document.getElementById('picker-file-input')?.click()}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Upload size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Upload</p>
                <p className="text-xs text-gray-500 mt-1">From computer</p>
              </div>
              <input
                id="picker-file-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </button>

            <button
              onClick={openExistingBrowser}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Search size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Library</p>
                <p className="text-xs text-gray-500 mt-1">Existing assets</p>
              </div>
            </button>

            <button
              onClick={() => setStep('url_details')}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Globe size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">URL</p>
                <p className="text-xs text-gray-500 mt-1">External link</p>
              </div>
            </button>

            <button
              onClick={() => setStep('youtube_details')}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Video size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">YouTube</p>
                <p className="text-xs text-gray-500 mt-1">Add YT Video</p>
              </div>
            </button>
          </div>
        );
      }

      if (step === 'youtube_details') {
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 dark:text-white">
                YouTube Video URL
              </label>
              <input
                type="text"
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
              <p className="text-xs text-gray-500">
                Paste any standard watch link, share link, or embedded YouTube link. We will extract
                the video details automatically.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 dark:text-white">Video Title</label>
              <input
                type="text"
                placeholder="e.g. Tutorial Video (Optional)"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 dark:text-white">
                Tags / Keywords
              </label>
              <TagInput
                defaultValue={keywords}
                onChange={setKeywords}
                placeholder="Add tags (press Enter or comma)..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setAlt('');
                  setKeywords([]);
                  setStep('selector');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-navy-300 dark:hover:bg-navy-800 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!url || isUploading}
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Add YouTube Video
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="py-6">
          <AssetMetadataForm
            step={step === 'upload_details' ? 'upload' : 'url'}
            file={file}
            url={url}
            setUrl={setUrl}
            alt={alt}
            setAlt={setAlt}
            keywords={keywords}
            setKeywords={setKeywords}
            module={modalModule}
            setModule={setModalModule}
            visibility={visibility}
            setVisibility={setVisibility}
            onBack={() => setStep('selector')}
            onSubmit={handleFinalSubmit}
            isProcessing={isUploading}
            submitLabel="Confirm & Add"
          />
        </div>
      );
    };

    openModal({
      title: 'Select Image Source',
      description: 'Choose how you want to add an image',
      size: 'lg',
      hideFooter: true,
      content: <PickerModalContent />,
    });
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      )}

      <div
        onClick={openSourceSelector}
        className={cn(
          'relative rounded-3xl border-2 border-dashed transition-all cursor-pointer group overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-navy-900/50',
          aspectClasses[aspectRatio],
          value
            ? 'border-transparent'
            : 'border-gray-200 dark:border-navy-700 hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-500/5',
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Selected"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <div className="bg-white/90 dark:bg-navy-800/90 p-3 rounded-2xl text-brand-600 font-bold flex items-center gap-2 shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                <ImageIcon size={20} />
                Change Image
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  onSelect?.(null);
                }}
                className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-navy-800/90 text-error-600 rounded-xl shadow-lg hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-brand-500 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-navy-800 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-brand-500/20 transition-all">
              {isUploading ? (
                <Loader2 size={32} className="animate-spin text-brand-500" />
              ) : (
                <ImageIcon size={32} />
              )}
            </div>
            <p className="font-bold text-sm">{placeholder}</p>
          </div>
        )}
      </div>
    </div>
  );
};
