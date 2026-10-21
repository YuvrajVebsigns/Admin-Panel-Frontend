'use client';

import React from 'react';
import { FileText, Upload, Search, X, Loader2 } from 'lucide-react';
import { useGlobalModal } from '@/hooks/useGlobalModal';
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
  const { openModal, closeModal } = useGlobalModal();
  const { uploadFile, isUploading } = useFiles();

  const openSourceSelector = () => {
    const openExistingBrowser = () => {
      openModal({
        title: 'Browse Document Library',
        size: '3xl',
        content: (
          <div className="max-h-[75vh] overflow-y-auto px-1">
            <FileBrowser
              initialFileType="document"
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
      const [step, setStep] = React.useState<'selector' | 'upload_details'>('selector');
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
        } else {
          return;
        }

        formData.append('module', modalModule);
        formData.append('visibility', visibility);
        formData.append('alt', alt || file.name);

        keywords.forEach((k) => formData.append('keywords[]', k));

        formData.append('entityType', 'manual_upload');
        formData.append('entityId', 'none');

        try {
          const response = await uploadFile(formData);
          onChange(response.url || '');
          onSelect?.(response);
          closeModal();
          toast.success('Document uploaded successfully');
        } catch (error) {
          toast.error('Failed to upload document');
        }
      };

      if (step === 'selector') {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
            <button
              onClick={() => document.getElementById('picker-document-input')?.click()}
              className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Upload size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Upload PDF/Doc</p>
                <p className="text-xs text-gray-500 mt-1">From computer</p>
              </div>
              <input
                id="picker-document-input"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={handleFileSelect}
              />
            </button>

            <button
              onClick={openExistingBrowser}
              className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
                <Search size={32} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Library</p>
                <p className="text-xs text-gray-500 mt-1">Existing documents</p>
              </div>
            </button>
          </div>
        );
      }

      return (
        <div className="py-6">
          <AssetMetadataForm
            step="upload"
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
      title: 'Select Document Source',
      description: 'Choose how you want to add a document',
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
          'relative rounded-2xl border-2 border-dashed transition-all cursor-pointer group overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-navy-900/50 p-6',
          value
            ? 'border-brand-500/30 dark:border-brand-500/20 bg-brand-50/5 dark:bg-brand-500/5'
            : 'border-gray-200 dark:border-navy-700 hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-500/5',
        )}
      >
        {value ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/10">
                <FileText size={22} />
              </div>
              <div className="text-left max-w-[250px] sm:max-w-[400px]">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {fileName || 'Document Selected'}
                </p>
                <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{value}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openSourceSelector();
                }}
                className="px-3 py-1.5 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 hover:border-brand-500 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                  onSelect?.(null);
                }}
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-brand-500 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-navy-800 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-brand-500/20 transition-all">
              {isUploading ? (
                <Loader2 size={28} className="animate-spin text-brand-500" />
              ) : (
                <FileText size={28} />
              )}
            </div>
            <p className="font-bold text-xs">{placeholder}</p>
          </div>
        )}
      </div>
    </div>
  );
};
