'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Link2, HardDrive, FileUp } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useFiles } from '../hooks/useFiles';
import { AssetMetadataForm } from './AssetMetadataForm';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const { uploadFile, isUploading } = useFiles();
  const [step, setStep] = useState<'selector' | 'upload' | 'url'>('selector');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [module, setModule] = useState('media');
  const [visibility, setVisibility] = useState('public');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep('upload');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStep('upload');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClose = () => {
    setStep('selector');
    setFile(null);
    setUrl('');
    setAlt('');
    setKeywords([]);
    setModule('media');
    setVisibility('public');
    setIsDragOver(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    if (step === 'upload' && file) {
      formData.append('file', file);
    } else if (step === 'url' && url) {
      formData.append('url', url);
    } else {
      return;
    }

    formData.append('module', module);
    formData.append('visibility', visibility);
    formData.append('alt', alt);
    keywords.forEach((k) => formData.append('keywords[]', k));
    formData.append('entityType', 'manual_upload');
    formData.append('entityId', 'none');

    try {
      await uploadFile(formData);
      handleClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const modalTitle =
    step === 'selector' ? 'Add New File' : step === 'upload' ? 'Upload Details' : 'Import from URL';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="lg">
      {step === 'selector' ? (
        <div className="space-y-5">
          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 group ${
              isDragOver
                ? 'border-brand-400 bg-brand-50/80 dark:bg-brand-500/10 scale-[1.01]'
                : 'border-gray-200 dark:border-navy-600 bg-gray-50/50 dark:bg-navy-900/30 hover:border-brand-300 dark:hover:border-brand-500/40 hover:bg-brand-50/30 dark:hover:bg-brand-500/5'
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isDragOver
                  ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 scale-110'
                  : 'bg-white dark:bg-navy-800 text-brand-500 shadow-sm border border-gray-100 dark:border-navy-700 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-brand-500/10'
              }`}
            >
              <FileUp size={28} strokeWidth={1.5} />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {isDragOver ? (
                  'Drop your file here'
                ) : (
                  <>
                    Drag & drop a file, or <span className="text-brand-500 font-bold">browse</span>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Supports images, videos, PDFs, documents — up to 50 MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              id="file-upload-input"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100 dark:bg-navy-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              or choose a source
            </span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-navy-700" />
          </div>

          {/* Source Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3.5 p-4 rounded-xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800/50 hover:border-brand-200 dark:hover:border-brand-500/30 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition-all group/card text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0 group-hover/card:scale-105 transition-transform">
                <HardDrive size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Local File</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  Upload from your device
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStep('url')}
              className="flex items-center gap-3.5 p-4 rounded-xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800/50 hover:border-purple-200 dark:hover:border-purple-500/30 hover:bg-purple-50/30 dark:hover:bg-purple-500/5 transition-all group/card text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 group-hover/card:scale-105 transition-transform">
                <Link2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">External URL</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  Import from a web link
                </p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <AssetMetadataForm
          step={step === 'upload' ? 'upload' : 'url'}
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
          onSubmit={(e) => handleSubmit(e as React.FormEvent)}
          isProcessing={isUploading}
        />
      )}
    </Modal>
  );
};
