'use client';

import { useState } from 'react';
import { FormWorkspace } from '@/components/common/FormWorkspace';
import { AssetMetadataForm } from './AssetMetadataForm';
import { useFiles } from '../hooks/useFiles';
import { FileData, FileVisibility } from '../types/file.types';

export function FileMetadataWorkspace({ file, onClose }: { file: FileData; onClose: () => void }) {
  const { updateFile, isUpdating } = useFiles();
  const [alt, setAlt] = useState(file.metadata?.alt || '');
  const [keywords, setKeywords] = useState<string[]>(file.keywords || []);
  const [module, setModule] = useState(file.module);
  const [visibility, setVisibility] = useState(file.visibility);

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    try {
      await updateFile({ id: file.id, data: { alt, keywords, module, visibility } });
      onClose();
    } catch {
      // The mutation hook reports errors and keeps the draft available for retry.
    }
  };

  return (
    <FormWorkspace
      title="Edit file metadata"
      description={file.originalName}
      onClose={() => !isUpdating && onClose()}
    >
      <AssetMetadataForm
        step="edit"
        existingFile={file}
        alt={alt}
        setAlt={setAlt}
        keywords={keywords}
        setKeywords={setKeywords}
        module={module}
        setModule={setModule}
        visibility={visibility}
        setVisibility={(value) => setVisibility(value as FileVisibility)}
        onBack={onClose}
        onSubmit={handleSubmit}
        isProcessing={isUpdating}
        submitLabel="Save metadata"
      />
    </FormWorkspace>
  );
}
