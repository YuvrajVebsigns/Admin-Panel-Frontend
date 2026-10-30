'use client';
import React, { useState } from 'react';
import { Loader2, Play } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { BackupCadence } from '../types/backup.types';
import { backupService } from '@/services/backup.service';
import toast from 'react-hot-toast';

interface ManualBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualBackupModal: React.FC<ManualBackupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [cadence, setCadence] = useState<BackupCadence>('manual');
  const [isFullDb, setIsFullDb] = useState(true);
  const [collectionsInput, setCollectionsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const collections = !isFullDb
        ? collectionsInput
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        : undefined;

      await backupService.triggerDatabaseBackup({
        cadence,
        collections,
      });

      toast.success('Database backup created and saved to S3 successfully!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to trigger database backup.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Trigger On-Demand Database Backup">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          This runs a live binary MongoDB dump (
          <code className="font-mono">mongodump --archive --gzip</code>) and streams it directly to
          your AWS S3 bucket.
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Storage Cadence
          </label>
          <select
            value={cadence}
            onChange={(e) => setCadence(e.target.value as BackupCadence)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="manual">Manual Backup (/backups/database/manual/)</option>
            <option value="daily">Daily Snapshot (/backups/database/daily/ - 30 Days TTL)</option>
            <option value="monthly">
              Monthly Archival (/backups/database/monthly/ - Permanent)
            </option>
          </select>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="fullDbCheck"
              checked={isFullDb}
              onChange={(e) => setIsFullDb(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
            />
            <label
              htmlFor="fullDbCheck"
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Dump Full Database (All Collections & Indexes)
            </label>
          </div>

          {!isFullDb && (
            <div className="mt-2">
              <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                Comma-separated specific collections (e.g. websites, forms, blogs)
              </label>
              <input
                type="text"
                value={collectionsInput}
                onChange={(e) => setCollectionsInput(e.target.value)}
                placeholder="websites, website_pages, blogs"
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isSubmitting ? 'Dumping & Uploading...' : 'Start Backup'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
