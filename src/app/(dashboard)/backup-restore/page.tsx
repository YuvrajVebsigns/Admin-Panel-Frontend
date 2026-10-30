'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Database, RefreshCw, Settings, Play, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { backupService } from '@/services/backup.service';
import {
  BackupRecord,
  BackupSettings,
  S3HealthStatus,
} from '@/modules/backup-restore/types/backup.types';
import { BackupStatsCards } from '@/modules/backup-restore/components/BackupStatsCards';
import { DatabaseBackupsTable } from '@/modules/backup-restore/components/DatabaseBackupsTable';
import { KeysAndConfigsSection } from '@/modules/backup-restore/components/KeysAndConfigsSection';
import { RestoreDatabaseModal } from '@/modules/backup-restore/components/RestoreDatabaseModal';
import { BackupSettingsModal } from '@/modules/backup-restore/components/BackupSettingsModal';
import { ManualBackupModal } from '@/modules/backup-restore/components/ManualBackupModal';
import toast from 'react-hot-toast';

export default function BackupRestorePage() {
  const roleKey = useAuthStore((state) => state.roleKey);
  const [records, setRecords] = useState<BackupRecord[]>([]);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [health, setHealth] = useState<S3HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedRecordForRestore, setSelectedRecordForRestore] = useState<BackupRecord | null>(
    null,
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [recordsRes, settingsRes, healthRes] = await Promise.all([
        backupService.getRecords({ limit: 100 }),
        backupService.getSettings(),
        backupService
          .checkHealth()
          .catch(() => ({ status: false, bucket: 'unknown', error: 'Failed to reach S3' })),
      ]);

      setRecords(recordsRes.docs || []);
      setSettings(settingsRes);
      setHealth(healthRes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load backup data.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Restrict to Super Admin Only
  if (roleKey && roleKey !== 'super_admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Super Admin Access Only
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            The Backup, Restore, and Disaster Recovery module contains high-privilege operations and
            is strictly restricted to Super Administrators.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Backup & Disaster Recovery
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daily 30-day snapshots, permanent monthly archives, one-click encrypted keys export, and
            S3 retention management.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition shadow-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            Schedule & S3 Settings
          </button>

          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            Backup Database Now
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <BackupStatsCards
        records={records}
        settings={settings}
        health={health}
        isLoading={isLoading}
      />

      {/* Keys & Configuration Snapshots */}
      <KeysAndConfigsSection onRefresh={fetchData} />

      {/* Database Archives Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
            Database Backup Archives on S3
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {records.filter((r) => r.type === 'database').length} total database archives
          </span>
        </div>

        <DatabaseBackupsTable
          records={records}
          isLoading={isLoading}
          onSelectForRestore={(record) => setSelectedRecordForRestore(record)}
          onRefresh={fetchData}
        />
      </div>

      {/* Modals */}
      <ManualBackupModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={fetchData}
      />

      <BackupSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsUpdated={(updated) => {
          setSettings(updated);
          fetchData();
        }}
      />

      <RestoreDatabaseModal
        isOpen={!!selectedRecordForRestore}
        onClose={() => setSelectedRecordForRestore(null)}
        record={selectedRecordForRestore}
        onSuccess={() => {
          setSelectedRecordForRestore(null);
          fetchData();
        }}
      />
    </div>
  );
}
