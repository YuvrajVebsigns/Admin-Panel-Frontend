'use client';
import React, { useState, useEffect } from 'react';
import { HardDrive, Calendar, Mail, Loader2, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { BackupSettings } from '../types/backup.types';
import { backupService } from '@/services/backup.service';
import toast from 'react-hot-toast';

interface BackupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BackupSettings | null;
  onSettingsUpdated: (updated: BackupSettings) => void;
}

export const BackupSettingsModal: React.FC<BackupSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsUpdated,
}) => {
  const [formData, setFormData] = useState({
    isDailyEnabled: true,
    dailyCron: '0 0 * * *',
    dailyRetentionDays: 30,
    isMonthlyEnabled: true,
    monthlyCron: '0 0 1 * *',
    emailMonthlyBackup: true,
    notificationEmails: '',
    bucket: 'core-media',
    region: 'auto',
    endpoint: '',
    basePrefix: 'backups/',
    forcePathStyle: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTestingHealth, setIsTestingHealth] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        isDailyEnabled: settings.isDailyEnabled ?? true,
        dailyCron: settings.dailyCron || '0 0 * * *',
        dailyRetentionDays: settings.dailyRetentionDays || 30,
        isMonthlyEnabled: settings.isMonthlyEnabled ?? true,
        monthlyCron: settings.monthlyCron || '0 0 1 * *',
        emailMonthlyBackup: settings.emailMonthlyBackup ?? true,
        notificationEmails: (settings.notificationEmails || []).join(', '),
        bucket: settings.s3StorageConfig?.bucket || 'core-media',
        region: settings.s3StorageConfig?.region || 'auto',
        endpoint: settings.s3StorageConfig?.endpoint || '',
        basePrefix: settings.s3StorageConfig?.basePrefix || 'backups/',
        forcePathStyle: settings.s3StorageConfig?.forcePathStyle ?? true,
      });
    }
  }, [settings]);

  const handleTestConnection = async () => {
    try {
      setIsTestingHealth(true);
      const res = await backupService.checkHealth();
      if (res.status) {
        toast.success(`S3 connected successfully to bucket: ${res.bucket}`);
      } else {
        toast.error(`S3 connection failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'S3 health check failed.';
      toast.error(message);
    } finally {
      setIsTestingHealth(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const emails = formData.notificationEmails
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.includes('@'));

      const updated = await backupService.updateSettings({
        isDailyEnabled: formData.isDailyEnabled,
        dailyCron: formData.dailyCron,
        dailyRetentionDays: Number(formData.dailyRetentionDays),
        isMonthlyEnabled: formData.isMonthlyEnabled,
        monthlyCron: formData.monthlyCron,
        emailMonthlyBackup: formData.emailMonthlyBackup,
        notificationEmails: emails,
        s3StorageConfig: {
          bucket: formData.bucket,
          region: formData.region,
          endpoint: formData.endpoint || undefined,
          basePrefix: formData.basePrefix,
          forcePathStyle: formData.forcePathStyle,
        },
      });

      toast.success('Backup & Storage settings updated successfully!');
      onSettingsUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update settings.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      title="Backup Schedules & S3 Storage Configuration"
    >
      <form onSubmit={handleSave} className="p-6 space-y-6">
        {/* Section 1: Automated Schedules */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
              Automated Schedule & Retention Policies
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Daily Backup Card */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Daily Snapshots
                </span>
                <input
                  type="checkbox"
                  checked={formData.isDailyEnabled}
                  onChange={(e) => setFormData({ ...formData, isDailyEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Daily Cron Expression (Default: 12:00 AM midnight)
                </label>
                <input
                  type="text"
                  value={formData.dailyCron}
                  onChange={(e) => setFormData({ ...formData, dailyCron: e.target.value })}
                  placeholder="0 0 * * *"
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Retention Window (Auto-prune older than X days)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={formData.dailyRetentionDays}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyRetentionDays: Number(e.target.value) })
                    }
                    className="w-24 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Days (Default: 30)
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Backup Card */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Monthly Permanent
                </span>
                <input
                  type="checkbox"
                  checked={formData.isMonthlyEnabled}
                  onChange={(e) => setFormData({ ...formData, isMonthlyEnabled: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded-sm focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Monthly Cron (Default: 1st of month at 12:00 AM)
                </label>
                <input
                  type="text"
                  value={formData.monthlyCron}
                  onChange={(e) => setFormData({ ...formData, monthlyCron: e.target.value })}
                  placeholder="0 0 1 * *"
                  className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="emailMonthly"
                  checked={formData.emailMonthlyBackup}
                  onChange={(e) =>
                    setFormData({ ...formData, emailMonthlyBackup: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded-sm focus:ring-purple-500"
                />
                <label
                  htmlFor="emailMonthly"
                  className="text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                >
                  Attach encrypted archive in email on 1st of month
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
              Notification & Delivery Recipients
            </h4>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Comma-separated emails to receive monthly backup archives and instant failure alerts.
          </p>
          <input
            type="text"
            value={formData.notificationEmails}
            onChange={(e) => setFormData({ ...formData, notificationEmails: e.target.value })}
            placeholder="admin@coremediagroup.com, devops@coremediagroup.com"
            className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Section 3: S3 Storage Settings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                S3 Storage Provider Configuration
              </h4>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingHealth}
              className="text-xs font-semibold px-2.5 py-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isTestingHealth ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Test S3 Connection
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                S3 Bucket Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.bucket}
                onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                S3 Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="auto or ap-south-1"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Base S3 Prefix (Default: backups/)
              </label>
              <input
                type="text"
                value={formData.basePrefix}
                onChange={(e) => setFormData({ ...formData, basePrefix: e.target.value })}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom Endpoint (Optional for Cloudflare R2 / MinIO)
              </label>
              <input
                type="text"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://s3.amazonaws.com or custom endpoint"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Settings
          </button>
        </div>
      </form>
    </Modal>
  );
};
