'use client';
import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Trash2,
  Search,
  Mail,
  Copy,
  Check,
  Loader2,
  FileArchive,
} from 'lucide-react';
import { BackupRecord } from '../types/backup.types';
import { backupService } from '@/services/backup.service';
import toast from 'react-hot-toast';

interface DatabaseBackupsTableProps {
  records: BackupRecord[];
  isLoading: boolean;
  onSelectForRestore: (record: BackupRecord) => void;
  onRefresh: () => void;
}

export const DatabaseBackupsTable: React.FC<DatabaseBackupsTableProps> = ({
  records,
  isLoading,
  onSelectForRestore,
  onRefresh,
}) => {
  const [selectedCadence, setSelectedCadence] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter records
  const dbRecords = records.filter((r) => r.type === 'database');

  const filteredRecords = dbRecords.filter((record) => {
    if (selectedCadence !== 'all' && record.cadence !== selectedCadence) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPath = record.s3Key?.toLowerCase().includes(q);
      const matchChecksum = record.checksum?.toLowerCase().includes(q);
      return matchPath || matchChecksum;
    }
    return true;
  });

  const handleDownload = async (record: BackupRecord) => {
    try {
      setDownloadingId(record.id);
      const { downloadUrl } = await backupService.getDownloadUrl(record.id);
      window.open(downloadUrl, '_blank');
      toast.success('Download link generated and opened!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate download link.';
      toast.error(message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (record: BackupRecord) => {
    if (record.isPermanent) {
      toast.error('Permanent monthly archives cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete backup archive:\n${record.s3Key}?`)) {
      return;
    }

    try {
      await backupService.deleteRecord(record.id);
      toast.success('Backup archive deleted successfully.');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete backup.';
      toast.error(message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Checksum copied to clipboard!');
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getExpiryText = (record: BackupRecord) => {
    if (record.isPermanent) {
      return <span className="text-purple-600 dark:text-purple-400 font-medium">Permanent</span>;
    }
    if (record.expiresAt) {
      const diffMs = new Date(record.expiresAt).getTime() - Date.now();
      const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return (
        <span className="text-gray-500 dark:text-gray-400">
          Expires in {diffDays} {diffDays === 1 ? 'day' : 'days'}
        </span>
      );
    }
    return <span className="text-gray-400">30-Day TTL</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Cadence Filters */}
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900/60 p-1 rounded-lg w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Archives' },
            { id: 'daily', label: 'Daily (30 Days)' },
            { id: 'monthly', label: 'Monthly (Permanent)' },
            { id: 'manual', label: 'Manual' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCadence(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
                selectedCadence === tab.id
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search path or checksum..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50/75 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Cadence & Status</th>
              <th className="py-3 px-4">Archive S3 Key</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Retention</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  Loading database backup archives...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <FileArchive className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  No database backup archives found matching filter.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const isMonthly = record.cadence === 'monthly';
                const isDaily = record.cadence === 'daily';

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition"
                  >
                    {/* Cadence & Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                            isMonthly
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                              : isDaily
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {record.cadence}
                        </span>

                        {record.status === 'completed' ? (
                          <span
                            className="w-2 h-2 rounded-full bg-emerald-500 inline-block"
                            title="Completed"
                          />
                        ) : record.status === 'in_progress' ? (
                          <span title="In Progress" className="inline-flex">
                            <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                          </span>
                        ) : (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 inline-block"
                            title="Failed"
                          />
                        )}

                        {record.emailedToAdmin && (
                          <span title="Emailed to Admin">
                            <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* S3 Key & Checksum */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md truncate">
                      <div className="font-mono text-gray-900 dark:text-gray-200 truncate font-medium">
                        {record.s3Key}
                      </div>
                      {record.checksum && (
                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 mt-0.5 font-mono text-[10px]">
                          <span>SHA: {record.checksum.slice(0, 16)}...</span>
                          <button
                            onClick={() => copyToClipboard(record.checksum!, record.id)}
                            className="hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {copiedId === record.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* File Size */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                      {formatFileSize(record.fileSizeBytes)}
                    </td>

                    {/* Retention */}
                    <td className="py-3 px-4 whitespace-nowrap">{getExpiryText(record)}</td>

                    {/* Created Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      <div>{new Date(record.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(record.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download */}
                        <button
                          onClick={() => handleDownload(record)}
                          disabled={downloadingId === record.id || record.status !== 'completed'}
                          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition disabled:opacity-40"
                          title="Generate Presigned Download URL"
                        >
                          {downloadingId === record.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>

                        {/* Restore */}
                        <button
                          onClick={() => onSelectForRestore(record)}
                          disabled={record.status !== 'completed'}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition disabled:opacity-40"
                          title="Restore Database from this Archive"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(record)}
                          disabled={record.isPermanent}
                          className={`p-1.5 rounded-md transition ${
                            record.isPermanent
                              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                          }`}
                          title={
                            record.isPermanent
                              ? 'Permanent monthly archives cannot be deleted'
                              : 'Delete archive from S3'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
