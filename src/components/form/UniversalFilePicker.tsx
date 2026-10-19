'use client';

import React, { useRef, useState } from 'react';
import { FileText, Upload, Search, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useFiles } from '@/modules/media/hooks/useFiles';
import { FileBrowser } from '@/modules/media/components/FileBrowser';
import { FileData } from '@/modules/media/types/file.types';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { AssetMetadataForm } from '@/modules/media/components/AssetMetadataForm';

interface UniversalFilePickerProps {
  value?: string;
  onChange: (url: string) => void;
  onSelect?: (file: FileData | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  module?: string;
  fileName?: string;
}

type PickerStep = 'closed' | 'selector' | 'library' | 'upload_details';

/** Inline asset picker. Selection and metadata are kept in the current page flow. */
export const UniversalFilePicker: React.FC<UniversalFilePickerProps> = ({
  value,
  onChange,
  onSelect,
  label,
  placeholder = 'Select Document',
  className,
  module = 'media',
  fileName,
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
    const formData = new FormData();
    if (file) formData.append('file', file);
    else return;
    formData.append('module', selectedModule);
    formData.append('visibility', visibility);
    formData.append('alt', alt || file.name);
    keywords.forEach((keyword) => formData.append('keywords[]', keyword));
    formData.append('entityType', 'manual_upload');
    formData.append('entityId', 'none');

    try {
      const response = await uploadFile(formData);
      onChange(response.url || '');
      onSelect?.(response);
      resetPicker();
      toast.success('Document added successfully');
    } catch {
      toast.error('Failed to upload document');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      )}
      {value ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
              <FileText size={21} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {fileName || 'Document selected'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{value}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('selector')}
              className="min-h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 hover:border-brand-500 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-200"
            >
              Change file
            </button>
            <button
              type="button"
              aria-label="Remove selected document"
              onClick={() => {
                onChange('');
                onSelect?.(null);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-error-100 bg-error-50 text-error-600 hover:bg-error-100 dark:border-error-500/30 dark:bg-error-500/10"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setStep('selector')}
          className="flex min-h-28 w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-600 dark:border-navy-700 dark:bg-navy-900/50 dark:hover:border-brand-500/60"
        >
          {isUploading ? (
            <Loader2 size={24} className="animate-spin text-brand-500" />
          ) : (
            <Upload size={24} aria-hidden="true" />
          )}
          <span className="text-sm font-semibold">{placeholder}</span>
        </button>
      )}

      {step !== 'closed' && (
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-navy-700 dark:bg-navy-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Add a document</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This workspace stays in the current form.
              </p>
            </div>
            <button
              type="button"
              onClick={resetPicker}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 dark:hover:bg-navy-800"
              aria-label="Close document picker"
            >
              <X size={18} />
            </button>
          </div>
          {step === 'selector' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-400 dark:border-navy-700 dark:bg-navy-900"
              >
                <Upload className="text-brand-500" size={22} />
                <span>
                  <strong className="block text-sm text-gray-900 dark:text-white">
                    Upload from device
                  </strong>
                  <small className="text-xs text-gray-500">PDF, document, or spreadsheet</small>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep('library')}
                className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-brand-400 dark:border-navy-700 dark:bg-navy-900"
              >
                <Search className="text-brand-500" size={22} />
                <span>
                  <strong className="block text-sm text-gray-900 dark:text-white">
                    Browse library
                  </strong>
                  <small className="text-xs text-gray-500">Choose an existing document</small>
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
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
                initialFileType="document"
                onSelect={(selected) => {
                  onChange(selected.url || '');
                  onSelect?.(selected);
                  resetPicker();
                }}
              />
            </>
          )}
          {step === 'upload_details' && (
            <AssetMetadataForm
              step="upload"
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
              submitLabel="Add document"
            />
          )}
        </div>
      )}
    </div>
  );
};
