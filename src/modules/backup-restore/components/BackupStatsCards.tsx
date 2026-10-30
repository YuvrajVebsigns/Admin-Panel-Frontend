'use client';
import React from 'react';
import { HardDrive, Calendar, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BackupRecord, BackupSettings, S3HealthStatus } from '../types/backup.types';

interface BackupStatsCardsProps {
  records: BackupRecord[];
  settings: BackupSettings | null;
  health: S3HealthStatus | null;
  isLoading: boolean;
}

export const BackupStatsCards: React.FC<BackupStatsCardsProps> = ({
  records,
  settings,
  health,
  isLoading,
}) => {
  const dailyRecords = records.filter((r) => r.cadence === 'daily' && r.status === 'completed');
  const monthlyRecords = records.filter((r) => r.cadence === 'monthly' && r.status === 'completed');

  const totalSizeBytes = records
    .filter((r) => r.status === 'completed')
    .reduce((acc, curr) => acc + (curr.fileSizeBytes || 0), 0);

  const totalSizeFormatted =
    totalSizeBytes > 1024 * 1024 * 1024
      ? `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* S3 Storage Health */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            S3 Storage Health
          </span>
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              health?.status
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
            }`}
          >
            {health?.status ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {isLoading ? 'Checking...' : health?.status ? 'Connected' : 'Offline'}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
          Bucket:{' '}
          <code className="text-blue-600 dark:text-blue-400 font-mono">
            {settings?.s3StorageConfig?.bucket || 'core-media'}
          </code>
        </p>
      </div>

      {/* Total Storage Used */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Backups Size
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : totalSizeFormatted}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({records.length} archives)
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Across daily, monthly & manual backups
        </p>
      </div>

      {/* Daily Snapshots */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Daily Snapshots
          </span>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : dailyRecords.length}
          </span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full font-medium">
            {settings?.dailyRetentionDays || 30} Days TTL
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Runs daily at 12:00 AM midnight
        </p>
      </div>

      {/* Monthly Permanent Archives */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Monthly Permanent
          </span>
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {isLoading ? '...' : monthlyRecords.length}
          </span>
          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full font-medium">
            Permanent
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          1st of month • Encrypted & Emailed
        </p>
      </div>
    </div>
  );
};
