'use client';

import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useFiles } from '../hooks/useFiles';
import { useGlobalModal } from '@/hooks/useGlobalModal';

import { AssetMetadataForm } from './AssetMetadataForm';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const { uploadFile, isUploading } = useFiles();
  const { closeModal } = useGlobalModal();
  const [step, setStep] = useState<'selector' | 'upload' | 'url'>('selector');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [module, setModule] = useState('media');
  const [visibility, setVisibility] = useState('public');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep('upload');
    }
  };

  const handleClose = () => {
    setStep('selector');
    setFile(null);
    setUrl('');
    setAlt('');
    setKeywords([]);
    onClose();
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    if (step === 'upload' && file) {
      formData.append('file', file);
    } else if (step === 'url' && url) {
      // Note: Backend needs to support URL upload or we just store the reference
      formData.append('url', url);
    } else {
      return;
    }

    formData.append('module', module);
    formData.append('visibility', visibility);
    formData.append('alt', alt);

    // Add keywords to FormData
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

  const renderSelector = () => (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4 py-4">
        <button
          type="button"
          onClick={() => document.getElementById('file-upload-input')?.click()}
          className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-200 transition-all group text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
            <Upload size={32} />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Local Upload</p>
            <p className="text-xs text-gray-500 mt-1">From computer</p>
          </div>
          <input
            type="file"
            id="file-upload-input"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>

        <button
          type="button"
          onClick={() => setStep('url')}
          className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-gray-100 dark:border-navy-700 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-200 transition-all group text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-navy-800 shadow-sm transition-all">
            <ImageIcon size={32} />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">From URL</p>
            <p className="text-xs text-gray-500 mt-1">External link</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderUploadForm = () => (
    <div className="p-6">
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
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-navy-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-navy-700">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New File</h3>
            <p className="text-xs text-gray-500 font-medium">Choose a source to add your asset</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-navy-900 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        {step === 'selector' ? renderSelector() : renderUploadForm()}
      </div>
    </div>
  );
};
