'use client';
import React, { useState } from 'react';
import { KeyRound, FileCode, Download, Upload, Lock, Layers, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { backupService } from '@/services/backup.service';
import toast from 'react-hot-toast';

interface KeysAndConfigsSectionProps {
  onRefresh: () => void;
}

export const KeysAndConfigsSection: React.FC<KeysAndConfigsSectionProps> = ({ onRefresh }) => {
  // Password export modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Restore keys modal
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restorePayload, setRestorePayload] = useState('');
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Config snapshot state
  const [isSnapshotting, setIsSnapshotting] = useState(false);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuickServerKeyExport = async () => {
    try {
      setIsExporting(true);
      const res = await backupService.exportKeys({ mode: 'server_key' });
      const filename = `core-media-keys-server-${Date.now()}.cmkey.enc`;
      downloadFile(JSON.stringify(res, null, 2), filename);
      toast.success('Keys encrypted and downloaded successfully!');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to export keys.';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCustomPasswordExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPassword || customPassword.length < 6) {
      toast.error('Passphrase must be at least 6 characters.');
      return;
    }

    try {
      setIsExporting(true);
      const res = await backupService.exportKeys({
        mode: 'password',
        password: customPassword,
      });
      const filename = `core-media-keys-protected-${Date.now()}.cmkey.enc`;
      downloadFile(JSON.stringify(res, null, 2), filename);
      toast.success('Passphrase-protected keys envelope downloaded!');
      setIsPasswordModalOpen(false);
      setCustomPassword('');
      onRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to export keys.';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restorePayload) {
      toast.error('Please paste or upload the encrypted key payload.');
      return;
    }
    if (!superAdminPassword) {
      toast.error('Super Admin account password is required.');
      return;
    }

    try {
      setIsRestoring(true);
      const res = await backupService.restoreKeys({
        encryptedPayload: restorePayload,
        password: restorePassphrase || undefined,
        superAdminPassword,
      });

      toast.success(
        `Successfully restored ${res.restoredProvidersCount} provider credentials: ${res.restoredProviderNames.join(', ')}`,
      );
      setIsRestoreModalOpen(false);
      setRestorePayload('');
      setRestorePassphrase('');
      setSuperAdminPassword('');
      onRefresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to restore keys. Please check password/payload.';
      toast.error(message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleConfigSnapshot = async () => {
    try {
      setIsSnapshotting(true);
      await backupService.triggerConfigBackup('Manual snapshot from Admin Panel');
      toast.success('Configuration snapshot created and stored in S3!');
      onRefresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create configuration snapshot.';
      toast.error(message);
    } finally {
      setIsSnapshotting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* One-Click Keys Backup & Restore */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                One-Click Keys & Credentials Backup
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AES-256-GCM encrypted export of communication provider API keys & secrets
              </p>
            </div>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 mb-5">
            Includes Brevo API keys, WhatsApp/Twilio secrets, S3 storage keys, and webhook signing
            tokens. Choose between instant server-key encryption or custom passphrase protection.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={handleQuickServerKeyExport}
            disabled={isExporting}
            className="flex-1 min-w-[140px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            One-Click Server Key
          </button>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition"
          >
            <Lock className="w-3.5 h-3.5" />
            Password Protected
          </button>

          <button
            type="button"
            onClick={() => setIsRestoreModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            Restore Keys
          </button>
        </div>
      </div>

      {/* Scheduled Configuration Snapshots */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Configuration & Template Snapshots
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JSON snapshots of platform settings, websites, forms & templates
              </p>
            </div>
          </div>

          <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-lg p-3 text-xs text-indigo-800 dark:text-indigo-300 mb-5">
            Captures website layouts, navigation menus, custom forms, SEO metadata, message
            templates, communication variables, and feature flags. Automatically runs daily at 12:30
            AM.
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Stored in:{' '}
            <code className="text-indigo-600 dark:text-indigo-400 font-mono">
              backups/configurations/
            </code>
          </span>

          <button
            type="button"
            onClick={handleConfigSnapshot}
            disabled={isSnapshotting}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
          >
            {isSnapshotting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileCode className="w-4 h-4" />
            )}
            {isSnapshotting ? 'Capturing...' : 'Take Snapshot Now'}
          </button>
        </div>
      </div>

      {/* Password Export Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Export Keys with Custom Passphrase"
        size="md"
      >
        <form onSubmit={handleCustomPasswordExport} className="p-6 space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Enter a strong passphrase to encrypt your credentials using AES-256-GCM. You will need
            this exact passphrase to restore these keys in the future.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Custom Passphrase (Min 6 chars) <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
              placeholder="Enter strong encryption passphrase"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting || customPassword.length < 6}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Encrypt & Download
            </button>
          </div>
        </form>
      </Modal>

      {/* Restore Keys Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Keys & Credentials"
        size="lg"
      >
        <form onSubmit={handleRestoreKeys} className="p-6 space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Upload or paste the encrypted JSON envelope (
            <code className="font-mono">.cmkey.enc</code>) to restore credentials.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Encrypted Envelope JSON Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={restorePayload}
              onChange={(e) => setRestorePayload(e.target.value)}
              placeholder="Paste contents of .cmkey.enc file here..."
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Decryption Passphrase (if custom protected)
            </label>
            <input
              type="password"
              value={restorePassphrase}
              onChange={(e) => setRestorePassphrase(e.target.value)}
              placeholder="Leave blank if encrypted via One-Click server key"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Super Admin Account Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={superAdminPassword}
              onChange={(e) => setSuperAdminPassword(e.target.value)}
              placeholder="Your current password to authorize key update"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsRestoreModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRestoring || !restorePayload || !superAdminPassword}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {isRestoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Authorize & Restore Keys
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
