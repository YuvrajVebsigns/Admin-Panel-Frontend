'use client';

import React, { useMemo } from 'react';
import {
  File as FileIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Trash2,
  Copy,
  Check,
  Eye,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/table/DataTable';
import Badge from '@/components/ui/badge/Badge';
import { FileData, FileStatus, FileVisibility } from '../types/file.types';
import { useFiles } from '../hooks/useFiles';
import { formatBytes } from '@/lib/utils';
import { useGlobalModal } from '@/hooks/useGlobalModal';
import { toast } from 'react-hot-toast';

interface FileTableProps {
  params: Record<string, unknown>;
  onParamsChange: (params: unknown) => void;
}

export const FileTable: React.FC<FileTableProps> = ({ params, onParamsChange }) => {
  const { files, meta, isLoading, deleteFile } = useFiles(params);
  const { confirm } = useGlobalModal();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyUrl = (file: FileData) => {
    // Note: The URL is constructed based on the environment, but the backend provides it in getUrl
    // For now we'll assume the URL is available or use a fallback
    const url = file.url || `${process.env.NEXT_PUBLIC_API_URL}/admin/files/${file.id}/url`;
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (file: FileData) => {
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

  const columns: Column<FileData>[] = useMemo(
    () => [
      {
        header: 'FILE',
        accessor: (file) => (
          <div className="flex items-center gap-4 py-2">
            <div className="relative w-12 h-12 rounded-xl bg-gray-50 dark:bg-navy-900 flex items-center justify-center border border-gray-100 dark:border-navy-700 overflow-hidden shrink-0 group">
              {(file.fileType === 'image' || file.mimeType.startsWith('image/')) &&
              (file.url || file.urlVariants?.thumbnail) ? (
                <img
                  src={file.urlVariants?.thumbnail || file.url}
                  alt={file.metadata?.alt || file.originalName}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              ) : file.fileType === 'image' || file.mimeType.startsWith('image/') ? (
                <ImageIcon className="w-6 h-6 text-brand-500" />
              ) : file.fileType === 'video' ? (
                <VideoIcon className="w-6 h-6 text-purple-500" />
              ) : file.fileType === 'audio' ? (
                <MusicIcon className="w-6 h-6 text-pink-500" />
              ) : (
                <FileIcon className="w-6 h-6 text-blue-500" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="font-bold text-gray-900 dark:text-white truncate"
                title={file.originalName}
              >
                {file.originalName}
              </span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                {file.mimeType}
              </span>
            </div>
          </div>
        ),
        className: 'min-w-[200px]',
      },
      {
        header: 'CONTEXT',
        accessor: (file) => (
          <div className="flex flex-col gap-1">
            <Badge color="light" className="w-fit text-[10px] py-0.5">
              {file.module.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-400">{file.entityType}</span>
          </div>
        ),
      },
      {
        header: 'SIZE',
        accessor: (file) => (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {formatBytes(file.size)}
          </span>
        ),
      },
      {
        header: 'VISIBILITY',
        accessor: (file) => (
          <Badge color={file.visibility === FileVisibility.PUBLIC ? 'success' : 'warning'}>
            {file.visibility.toUpperCase()}
          </Badge>
        ),
      },
      {
        header: 'STATUS',
        accessor: (file) => (
          <Badge
            color={
              file.status === FileStatus.READY
                ? 'success'
                : file.status === FileStatus.PROCESSING
                  ? 'warning'
                  : 'error'
            }
          >
            {file.status.toUpperCase()}
          </Badge>
        ),
      },
      {
        header: 'ACTIONS',
        accessor: (file) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCopyUrl(file)}
              className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all"
              title="Copy URL"
            >
              {copiedId === file.id ? (
                <Check size={16} className="text-success-500" />
              ) : (
                <Copy size={16} />
              )}
            </button>
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                title="View File"
              >
                <Eye size={16} />
              </a>
            )}
            <button
              onClick={() => handleDelete(file)}
              className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-all"
              title="Delete File"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [copiedId, deleteFile, confirm],
  );

  return (
    <DataTable<FileData>
      columns={columns}
      data={files}
      isLoading={isLoading}
      serverSide
      totalItems={meta?.total}
      page={Number(params.page)}
      limit={Number(params.limit)}
      onPageChange={(page) => onParamsChange({ ...params, page })}
      onPageSizeChange={(limit) => onParamsChange({ ...params, limit, page: 1 })}
    />
  );
};
