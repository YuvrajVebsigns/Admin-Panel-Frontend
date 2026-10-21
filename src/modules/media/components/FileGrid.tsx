'use client';

import {
  File as FileIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Trash2,
  Copy,
  Check,
  Eye,
  Edit2,
} from 'lucide-react';
import { FileData, FileVisibility } from '../types/file.types';
import { useFiles } from '../hooks/useFiles';
import { formatBytes } from '@/lib/utils';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import { toast } from 'react-hot-toast';
import Badge from '@/components/ui/badge/Badge';
import { useState } from 'react';
import { AssetMetadataForm } from './AssetMetadataForm';

interface FileGridProps {
  params: Record<string, unknown>;
  onParamsChange?: (params: unknown) => void;
  onSelect?: (file: FileData) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ params, onSelect }) => {
  const { files, isLoading, deleteFile, updateFile, isUpdating } = useFiles(params);
  const { confirm, openModal, closeModal } = useGlobalModal();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = (e: React.MouseEvent, file: FileData) => {
    e.stopPropagation();
    const url = file.url || '';
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (e: React.MouseEvent, file: FileData) => {
    e.stopPropagation();

    const FileEditContent = () => {
      const [alt, setAlt] = useState(file.metadata?.alt || '');
      const [keywords, setKeywords] = useState<string[]>(file.keywords || []);
      const [module, setModule] = useState(file.module);
      const [visibility, setVisibility] = useState(file.visibility);

      const handleSubmit = async () => {
        try {
          await updateFile({
            id: file.id,
            data: {
              alt,
              keywords,
              module,
              visibility,
            },
          });
          closeModal();
        } catch (error) {
          // Error is handled by hook
        }
      };

      return (
        <div className="py-6">
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
            setVisibility={setVisibility as unknown as (val: string) => void}
            onBack={closeModal}
            onSubmit={handleSubmit}
            isProcessing={isUpdating}
            submitLabel="Update Metadata"
          />
        </div>
      );
    };

    openModal({
      title: 'Edit File Metadata',
      description: 'Update the keywords and description for better search',
      size: 'lg',
      hideFooter: true,
      content: <FileEditContent />,
    });
  };

  const handleDelete = (e: React.MouseEvent, file: FileData) => {
    e.stopPropagation();
    confirm({
      title: 'Delete File',
      message: `Are you sure you want to delete "${file.originalName}"? This will permanently remove it from storage.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        await deleteFile(file.id);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-3xl bg-gray-50 dark:bg-navy-900 animate-pulse border border-gray-100 dark:border-navy-700"
          />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <FileIcon size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">No files found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onSelect?.(file)}
          className={`group relative bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${onSelect ? 'cursor-pointer ring-offset-2 hover:ring-2 hover:ring-brand-500' : ''}`}
        >
          {/* Preview Area */}
          <div className="aspect-square relative bg-gray-50 dark:bg-navy-900 flex items-center justify-center overflow-hidden">
            {(file.fileType === 'image' || file.mimeType.startsWith('image/')) &&
            (file.url || file.urlVariants?.thumbnail) ? (
              <img
                src={file.urlVariants?.thumbnail || file.url}
                alt={file.metadata?.alt || file.originalName}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-300 dark:text-navy-600 transition-colors group-hover:text-brand-500">
                {file.fileType === 'video' ? (
                  <VideoIcon size={40} />
                ) : file.fileType === 'audio' ? (
                  <MusicIcon size={40} />
                ) : (
                  <FileIcon size={40} />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {(file.extension || '').replace('.', '')}
                </span>
              </div>
            )}

            {/* Visibility Badge */}
            <div className="absolute top-3 left-3">
              <Badge
                color={file.visibility === FileVisibility.PUBLIC ? 'success' : 'warning'}
                className="shadow-sm backdrop-blur-md bg-opacity-80 border-none text-[10px] px-2 py-0.5"
              >
                {file.visibility.toUpperCase()}
              </Badge>
            </div>

            {/* Hover Actions Overlay */}
            {!onSelect && (
              <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => handleEdit(e, file)}
                  className="w-9 h-9 rounded-xl bg-white text-brand-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  title="Edit Metadata"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => handleCopyUrl(e, file)}
                  className="w-9 h-9 rounded-xl bg-white text-brand-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  title="Copy URL"
                >
                  {copiedId === file.id ? <Check size={18} /> : <Copy size={18} />}
                </button>
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    title="View Original"
                  >
                    <Eye size={18} />
                  </a>
                )}
                <button
                  onClick={(e) => handleDelete(e, file)}
                  className="w-9 h-9 rounded-xl bg-white text-error-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}

            {/* Selection Overlay (if onSelect) */}
            {onSelect && (
              <div className="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white text-brand-600 p-2 rounded-full shadow-lg scale-75 group-hover:scale-100 transition-transform">
                  <Check size={20} strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          {/* Info Area */}
          <div className="p-4">
            <h4
              className="text-sm font-bold text-gray-900 dark:text-white truncate mb-1"
              title={file.originalName}
            >
              {file.originalName}
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-400">
                {formatBytes(file.size)}
              </span>
              <Badge color="light" className="text-[9px] px-1.5 py-0">
                {file.module.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
