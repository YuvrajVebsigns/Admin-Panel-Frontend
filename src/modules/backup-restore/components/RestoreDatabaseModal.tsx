'use client';
import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Loader2, Database, Layers } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { BackupRecord } from '../types/backup.types';
import { backupService } from '@/services/backup.service';
import toast from 'react-hot-toast';

interface RestoreDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BackupRecord | null;
  onSuccess: () => void;
}

const COMMON_COLLECTIONS = [
  'websites',
  'website_pages',
  'navbars',
  'menu_items',
  'blogs',
  'custom_forms',
  'form_submissions',
  'events',
  'attendees',
  'sponsors',
  'contacts',
  'subscribes',
  'nominations',
  'roles',
  'communication_providers',
  'message_templates',
];

export const RestoreDatabaseModal: React.FC<RestoreDatabaseModalProps> = ({
  isOpen,
  onClose,
  record,
  onSuccess,
}) => {
  const [restoreMode, setRestoreMode] = useState<'full' | 'selective'>('full');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [confirmationText, setConfirmationText] = useState('');
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    message: string;
    preRestoreSnapshotId?: string;
  } | null>(null);

  if (!record) return null;

  const toggleCollection = (name: string) => {
    setSelectedCollections((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmationText !== 'CONFIRM_RESTORE') {
      toast.error('You must type CONFIRM_RESTORE exactly to proceed.');
      return;
    }
    if (!superAdminPassword) {
      toast.error('Super Admin password is required.');
      return;
    }
    if (restoreMode === 'selective' && selectedCollections.length === 0) {
      toast.error('Please select at least one collection to restore.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await backupService.restoreDatabase({
        backupRecordId: record.id,
        confirmationText,
        superAdminPassword,
        collections: restoreMode === 'selective' ? selectedCollections : undefined,
      });

      setRestoreResult(res);
      toast.success('Database restore completed successfully!');
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Restoration failed. Please verify credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    confirmationText === 'CONFIRM_RESTORE' &&
    superAdminPassword.length > 0 &&
    (restoreMode === 'full' || selectedCollections.length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Disaster Recovery & Database Restore"
    >
      <div className="p-6">
        {restoreResult ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Restore Completed Successfully!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              The database has been restored from{' '}
              <code className="font-mono text-blue-600 dark:text-blue-400">{record.s3Key}</code>.
            </p>
            {restoreResult.preRestoreSnapshotId && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-xs text-left mb-6 border border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Pre-Restore Safety Snapshot ID:
                </span>
                <span className="font-mono text-gray-600 dark:text-gray-400">
                  {restoreResult.preRestoreSnapshotId}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition"
            >
              Close Wizard
            </button>
          </div>
        ) : (
          <form onSubmit={handleRestore} className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-800 dark:text-rose-200">
                  <p className="font-bold text-sm">Critical Warning: Destructive Action</p>
                  <p className="mt-1">
                    Restoring this snapshot will overwrite live database collections. Core Media
                    will automatically capture a{' '}
                    <strong>pre-restore safety checkpoint snapshot</strong> before applying changes.
                  </p>
                </div>
              </div>
            </div>

            {/* Target Backup Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Archive Path:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-gray-200 truncate block">
                  {record.s3Key}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Cadence / Type:</span>
                <span className="font-medium text-gray-900 dark:text-gray-200 uppercase">
                  {record.cadence} ({record.isPermanent ? 'Permanent' : '30-Day TTL'})
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Size:</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  {(record.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Created At:</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">
                  {new Date(record.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Restore Mode Switcher */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Choose Restoration Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRestoreMode('full')}
                  className={`p-3 rounded-lg border text-left flex items-start gap-3 transition ${
                    restoreMode === 'full'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold block">Full Database Restore</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Replaces all collections with archive contents
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRestoreMode('selective')}
                  className={`p-3 rounded-lg border text-left flex items-start gap-3 transition ${
                    restoreMode === 'selective'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold block">
                      Selective Collection Restore
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Restores only chosen collections, keeping others intact
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Selective Collections Checklist */}
            {restoreMode === 'selective' && (
              <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select collections to restore:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {COMMON_COLLECTIONS.map((col) => {
                    const isSelected = selectedCollections.includes(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => toggleCollection(col)}
                        className={`text-xs px-2.5 py-1.5 rounded-md font-mono text-left truncate border transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Super Admin Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Super Admin Account Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={superAdminPassword}
                onChange={(e) => setSuperAdminPassword(e.target.value)}
                placeholder="Enter your current password to authorize"
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Mandatory Confirmation Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Type{' '}
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                  CONFIRM_RESTORE
                </span>{' '}
                to proceed
              </label>
              <input
                type="text"
                required
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="CONFIRM_RESTORE"
                className="w-full text-sm font-mono px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Executing Restore...' : 'Restore Database'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
