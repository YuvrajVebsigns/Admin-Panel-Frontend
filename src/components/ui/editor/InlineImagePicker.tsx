'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Globe, Image as ImageIcon, Search, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TagInput from '@/components/form/input/TagInput';
import { AssetMetadataForm } from '@/modules/media/components/AssetMetadataForm';
import { FileBrowser } from '@/modules/media/components/FileBrowser';
import { useFiles } from '@/modules/media/hooks/useFiles';

interface InlineImagePickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

type Step = 'selector' | 'library' | 'upload' | 'url';

export function InlineImagePicker({ onSelect, onClose }: InlineImagePickerProps) {
  const { uploadFile, isUploading } = useFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [module, setModule] = useState('blogs');
  const [step, setStep] = useState<Step>('selector');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [visibility, setVisibility] = useState('public');

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!file && !url) return;
    const formData = new FormData();
    if (file && step === 'upload') formData.append('file', file);
    else if (url && step === 'url') formData.append('url', url);
    else return;
    formData.append('module', module);
    formData.append('visibility', visibility);
    formData.append('alt', alt || 'Blog image');
    keywords.forEach((keyword) => formData.append('keywords[]', keyword));
    formData.append('entityType', 'blog_content');
    formData.append('entityId', 'none');
    try {
      const response = await uploadFile(formData);
      onSelect(response.url || '');
      onClose();
      toast.success('Image selected');
    } catch {
      toast.error('Failed to upload image');
    }
  };

  return (
    <section
      className="mt-4 space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-500/5"
      aria-label="Add image"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Add image to content</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose a source without leaving this editor.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 dark:hover:bg-navy-800"
          aria-label="Close image picker"
        >
          <X size={18} />
        </button>
      </div>
      {step === 'selector' && (
        <div className="grid gap-3 sm:grid-cols-3">
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
              <small className="text-xs text-gray-500">Existing image</small>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStep('url')}
            className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-400 dark:border-navy-700 dark:bg-navy-900"
          >
            <Globe className="text-brand-500" size={22} />
            <span>
              <strong className="block text-sm text-gray-900 dark:text-white">URL</strong>
              <small className="text-xs text-gray-500">External image</small>
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) {
                setFile(selected);
                setStep('upload');
              }
            }}
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
              onSelect(selected.url || '');
              onClose();
            }}
          />
        </>
      )}
      {step === 'url' && (
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
            Image URL
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-navy-700 dark:bg-navy-900"
              placeholder="https://…"
            />
          </label>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
            Alt text
            <input
              type="text"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-navy-700 dark:bg-navy-900"
            />
          </label>
          <TagInput defaultValue={keywords} onChange={setKeywords} placeholder="Add tags" />
          <div className="flex justify-end gap-2">
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
              onClick={() => submit()}
              className="min-h-10 rounded-lg bg-brand-500 px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              Add image
            </button>
          </div>
        </div>
      )}
      {step === 'upload' && (
        <AssetMetadataForm
          step="upload"
          file={file}
          url={url}
          setUrl={setUrl}
          alt={alt}
          setAlt={setAlt}
          keywords={keywords}
          setKeywords={setKeywords}
          module={module}
          setModule={setModule}
          visibility={visibility}
          setVisibility={setVisibility}
          onBack={() => setStep('selector')}
          onSubmit={submit}
          isProcessing={isUploading}
          submitLabel="Select image"
        />
      )}
      {step === 'selector' && (
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <ImageIcon size={14} /> Images are uploaded to the Core Media library.
        </p>
      )}
    </section>
  );
}
